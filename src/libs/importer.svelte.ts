import type { SimpleAPPost } from "./providers/APDataProvider";
import type { FoundPost, DataProvider, SimplePost } from "./providers/DataProvider";
import AP from "./net/AnimePictures";
import SN from "./net/SauceNAO";
import APPostProvider from "./providers/APDataProvider";
import storage from "./storage.svelte";
import { localTime, percent } from "./utils.svelte";

type State = {
    progress: number,
    paused: boolean,
    finished: boolean,
    requiredAttempts: number,
    availableAttempts: number,
    error: string | null;
    status: string;
    eta: number; // timestamp
};
type Result = {
    source: SimplePost|null,
    result: SimpleAPPost,
    sim: number,
};
type SavedResult = {
    providerName: string,
    query: string,
    date: number,
    results: Result[],
}
export type { State, Result, SavedResult };

/**
 * Class to take pics on an image board and find the most similar on Anime-pictures using SauceNAO
 */
export default class Importer<
    Post extends { id?:any },
    Provider extends DataProvider<Post, SimplePost>
> {
    #provider: Provider;
    #query: string;
    #iterator: AsyncIterableIterator<FoundPost<Post>>;
    #doPause = false;
    #started = 0;
    #paused = 0;
    readonly state: State = $state({
        progress: 0,
        paused: true,
        finished: false,
        error: null,
        status: "initialization",
        requiredAttempts: 0,
        availableAttempts: 0,
        eta: 0,
    });

    readonly results: Result[] = [];

    constructor (provider: Provider, query: string) {
        this.#provider = provider;
        this.#query = query;
        this.#iterator = provider.findPosts(query);
    }

    /**
     * Find one next picture
     */
    private async iterate (): Promise<void> {
        if (this.state.finished || this.state.paused) return;

        if (this.#doPause) {
            this.#doPause = false;
            this.#paused = Date.now();
            this.state.paused = true;
            return;
        }

        const search = await this.#iterator.next();

        if (search.done) { // it was the last page so save the results
            this.results.sort((a, b) => +b.sim - +a.sim);
            const res: SavedResult = {
                query: decodeURIComponent(this.#query),
                providerName: this.#provider.sourceName,
                results: this.results,
                date: Date.now(),
            };
            storage[`res_${res.date}`] = res;
            this.state.paused = true;
            this.state.finished = true;
            return;
        }

        const { post, progress } = search.value;
        this.state.progress = progress * 100;
        this.state.eta = (Date.now() - this.#started) / progress + this.#started;
        this.state.status = (
            `${percent(progress)}%: post №${post.id}, ETA: ${localTime(this.state.eta)}`
        );
        try {
            const source = this.#provider.simplifyPost(post);
            const simRes = await SN.searchOnAnimePictures(this.#provider.getImage(source, "150"));
            for (const res of simRes) {
                // eslint-disable-next-line no-await-in-loop
                const apPost = await AP.getPostInfo(res.data["anime-pictures_id"]);
                // drop tag list to decrease the size of the saved data
                apPost.tags = [];
                apPost.file_url = "";

                const prevMatch = this.results.find(({ result }) => result.id === apPost.post.id);
                if (!prevMatch || prevMatch.sim < +res.header.similarity) {
                    if (prevMatch && prevMatch.sim < +res.header.similarity) {
                        this.results.splice(this.results.indexOf(prevMatch), 1);
                    }
                    this.results.push({
                        source,
                        result: APPostProvider.simplifyPost(apPost.post),
                        sim: +res.header.similarity,
                    });
                }
            }
        } catch (ex: any) {
            console.error(post, ex);
            this.state.error = ex.message;
            this.state.paused = true;
        }

        this.iterate();
    }

    /**
     * Initiate pausing of the importer
     */
    pause (): void {
        this.#doPause = true;
    }

    /**
     * Continue the importer's work
     * @param {boolean} [force=false] If true, continue work even if there are
     * no enough available search attempts
     * @returns {Promise<boolean>} whether the work was resumed
     */
    async resume (force: boolean = false): Promise<boolean> {
        if (this.state.finished) return false;

        if (!force) {
            // check whether there are enough search attempts to find all the post
            try {
                this.state.availableAttempts = await SN.availableAttempts();
                this.state.requiredAttempts = await this.#provider.postCount(this.#query);
            } catch (ex: any) {
                this.state.error = ex.message;
                throw ex;
            }
            const remainingRequiredAttempts = this.state.requiredAttempts - this.results.length;
            if (this.state.availableAttempts / remainingRequiredAttempts < 0.99) {
                return false;
            }
        }

        // just was about to pause
        if (this.#doPause) {
            this.#doPause = false;
        // was completely paused
        } else if (this.state.paused) {
            this.state.paused = false;
            this.state.error = null;
            // subtract the time spent before the pause
            this.#started = Date.now() - (this.#started ? this.#paused - this.#started : 0);
            this.iterate();
        }
        return true;
    }
}

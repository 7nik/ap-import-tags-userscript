import { writable, Readable } from 'svelte/store';
import type { SimpleAPPost } from './providers/APDataProvider';
import APPostProvider from './providers/APDataProvider';
import LocalValue from "./localStorage";
import AP from "./net/AnimePictures";
// import DB from "./net/Danbooru";
import SN from "./net/SauceNAO";
// import type { PostInfo } from "./net/Danbooru";
import type { FoundPost, DataProvider, SimplePost } from './providers/DataProvider';

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
 * Class to take pics on Danbooru and find the most similar on Anime-pictures user SauceNAO
 */
export default class Importer<Post extends {id?:any}, Provider extends DataProvider<Post, SimplePost>> {
    private provider: Provider;
    private query: string;
    private iterator: AsyncIterableIterator<FoundPost<Post>>;
    private doPause = false;
    private started = 0;
    private paused = 0;
    // private posts:PostInfo[] = [];
    private stateObj: State = {
        progress: 0,
        paused: true,
        finished: false,
        error: null,
        status: "initialization",
        requiredAttempts: 0,
        availableAttempts: 0,
        eta: 0,
    };
    readonly results: Result[] = [];
    readonly state: Readable<State>;

    constructor (provider: Provider, query: string) {
        this.provider = provider;
        this.query = query;
        this.iterator = provider.findPosts(query);

        const stateStore = writable(this.stateObj);
        this.stateObj = new Proxy(this.stateObj, {
            set: (state: State, prop: keyof State, value) => {
                // @ts-ignore
                state[prop] = value;
                stateStore.set(state);
                return true;
            }
        })
        this.state = {
            subscribe: stateStore.subscribe,
        };
    }

    /**
     * Find one next picture
     */
    private async iterate (): Promise<void> {
        if (this.stateObj.finished || this.stateObj.paused) return;

        if (this.doPause) {
            this.doPause = false;
            this.stateObj.paused = true;
            return;
        }

        const res = await this.iterator.next();

        if (res.done) { // it was the last page so save the results
            this.results.sort((a, b) => +b.sim - +a.sim);
            const res: SavedResult = {
                query: decodeURIComponent(this.query),
                providerName: this.provider.sourceName,
                results: this.results,
                date: Date.now(),
            };
            new LocalValue(`res_${res.date}`, {}).set(res);
            this.stateObj.paused = true;
            this.stateObj.finished = true;
            return;
        }

        let { post, progress } = res.value;
        this.stateObj.progress = progress * 100;
        this.stateObj.eta = (Date.now() - this.started) / progress + this.started;
        this.stateObj.status = `${Math.round(progress*10_000)/100}%: post №${post.id}, ETA: ${new Date(this.stateObj.eta).toLocaleTimeString()}`;
        try {
            const source = this.provider.simplifyPost(post);
            const simRes = await SN.searchOnAnimePictures(this.provider.getImage(source, "150"));
            for (const res of simRes) {
                const apPost = await AP.getPostInfo(res.data['anime-pictures_id']);
                // drop tag list to decrease the size of the saved data
                apPost.tags = [];
                apPost.file_url = "";

                if (!this.results.find(({ result }) => result.id === apPost.post.id)) {
                    this.results.push({
                        source,
                        result: APPostProvider.simplifyPost(apPost.post),
                        sim: +res.header.similarity,
                    });
                }
            }
        } catch (ex: any) {
            console.error(post, ex);
            this.stateObj.error = ex.message;
            this.stateObj.paused = true;
        }

        // this.done += 1;
        // this.stateObj.progress = this.done / this.stateObj.requiredAttempts * 100;
        this.iterate();
    }

    /**
     * Initiate pausing of the importer
     */
    pause (): void {
        this.doPause = true;
    }

    /**
     * Continue the importer's work
     * @param {boolean} [force=false] If true, continue work even if there are
     * no enough available search attempts
     * @returns {Promise<boolean>} whether the work was resumed
     */
    async resume (force: boolean = false): Promise<boolean> {
        if (this.stateObj.finished) return false;

        if (!force) {
            // check whether there are enough search attempts to find all the post
            try {
                this.stateObj.availableAttempts = await SN.availableAttempts();
                this.stateObj.requiredAttempts = await this.provider.postCount(this.query);
            } catch (ex: any) {
                this.stateObj.error = ex.message;
                throw ex;
            }
            if (this.stateObj.availableAttempts / (this.stateObj.requiredAttempts - this.results.length) < 0.99) {
                return false;
            }
        }

        if (this.doPause) {
            // just was about to pause
            this.doPause = false;
            this.paused = Date.now();
        } else {
            // was completely paused
            if (this.stateObj.paused) {
                this.stateObj.paused = false;
                this.stateObj.error = null;
                if (this.started) {
                    this.started = Date.now() - (this.paused - this.started);
                } else {
                    this.started = Date.now();
                }
                this.iterate();
            }
        }
        return true;
    }
}

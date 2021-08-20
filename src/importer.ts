import { readable, get, Readable, Subscriber } from 'svelte/store';
import LocalValue from "./localStorage.js";
import { 
    AnimePictures, 
    Danbooru, 
    SauceNAO, 
    AnimePicturesPostInfo, 
    DanbooruPostInfo, 
    SnrAnimePictures
} from "./ajax.js"; 

type State = {
    progress: number,
    paused: boolean,
    finished: boolean,
    requiredAttempts: number,
    availableAttempts: number,
    error: string;
};
type Result = {
    dbLink: string,
    dbImg: string,
    sim: number|string,
    id: number,
    link: string,
    preview: string,
    width: number,
    height: number,
    erotics: 0|1|2|3,
    color: [number, number, number],
    status: 0|-2|1|2,
    tagsCount: number,

};
type SavedResult = {
    query: string,
    results: Result[],
    date: number,
    count: number,
}
export type { State, SavedResult };

/**
 * Class to take pics on Danbooru and find the most similar on Anime-pictures user SauceNAO
 */
export default class Importer {
    private query: string;
    private doPause = false;
    private page = 0;
    private done = 0;
    private posts:DanbooruPostInfo[] = [];
    // @ts-ignore - readable's callback is called immediately
    private saveState: Function;
    private stateObj = {
        progress: 0,
        paused: true,
        finished: false,
        error: "",
        requiredAttempts: 0,
        availableAttempts: 0,
    };
    readonly results: Result[] = [];
    readonly state: Readable<State>;

    constructor (query: string) {
        this.query = query;
        this.state = readable(this.stateObj, (set) => { this.saveState = () => set(this.stateObj); });
    }

    /**
     * Find one next picture
     */
    private async iterate (): Promise<void> {
        if (this.stateObj.finished || this.stateObj.paused) return;

        if (this.doPause) {
            this.doPause = false;
            this.stateObj.paused = true;
            this.saveState();
            return;
        }
        
        let post = this.posts.pop();
        if (!post) {
            // load posts from next page
            this.page += 1;
            this.posts = await Danbooru.findPosts(this.query, this.page);
            post = this.posts.pop();
            if (!post) {
                // it was the last page so save the results
                this.results.sort((a, b) => +b.sim - +a.sim);
                new LocalValue(`res_${Date.now()}`, {}).set({
                    query: decodeURIComponent(this.query),
                    results: this.results,
                    date: Date.now(),
                    count: this.results.length,
                });
                this.stateObj.paused = true;
                this.stateObj.finished = true;
                this.saveState();
                return;
            }
        }

        try {
            if (post.preview_file_url) {
                const simRes = await SauceNAO.findClosestOnAnimePictures(post.preview_file_url);
                const apPost = await AnimePictures.getPostInfo(simRes.data['anime-pictures_id']);
                if (!this.results.find(({ id }) => id === apPost.id)) {
                    this.results.push({
                        dbLink: `https://danbooru.donmai.us/posts/${post.id}`,
                        dbImg:  post.preview_file_url,
                        sim:    simRes.header.similarity,
                        id:     simRes.data['anime-pictures_id'],
                        link:   simRes.data.ext_urls[0],
                        preview:    apPost.small_preview,
                        width:      apPost.width,
                        height:     apPost.heiht,
                        erotics:    apPost.erotics,
                        color:      apPost.color,
                        status:     apPost.status,
                        tagsCount:  apPost.tags_count,
                    });
                }
            } else {
                if (post.is_banned) {
                    console.warn("\nBanned picture", {
                        source: post.source,
                        main_tags: [
                            post.tag_string_copyright,
                            post.tag_string_character,
                            post.tag_string_artist,
                        ].join(" "),
                    });
                } else if (!post.id) {
                    console.warn("\nGold+ picture", {
                        main_tags: [
                            post.tag_string_copyright,
                            post.tag_string_character,
                            post.tag_string_artist,
                        ].join(" "),
                    });
                } else {
                    console.log("No preview", post);
                }
            }
        } catch (ex) {
            console.error(ex);
            this.stateObj.error = ex.message;
            this.stateObj.paused = true;
        }

        this.done += 1;
        this.stateObj.progress = this.done / this.stateObj.requiredAttempts * 100;
        this.saveState();
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
        if (!force) {
            // check whether there are enough search attempts to find all the post
            this.stateObj.availableAttempts = await SauceNAO.availableAttempts();
            this.stateObj.requiredAttempts = await Danbooru.postCount(this.query);
            if (this.stateObj.availableAttempts / (this.stateObj.requiredAttempts - this.done) < 0.99) {
                return false;
            }
        }
        
        if (this.doPause) {
            // just was about to pause
            this.doPause = false;
        } else {
            // was completely paused
            if (this.stateObj.paused) {
                this.stateObj.paused = false;
                this.stateObj.error = "";
                this.saveState();
                this.iterate();
            }
        }
        return true;
    }
}

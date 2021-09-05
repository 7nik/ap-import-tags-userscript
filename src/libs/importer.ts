import { readable, Readable } from 'svelte/store';
import LocalValue from "./localStorage";
import AP, { ShortPostInfo } from "./net/AnimePictures"; 
import DB from "./net/Danbooru"; 
import SN from "./net/SauceNAO"; 
import type { PostInfo } from "./net/Danbooru"; 

type State = {
    progress: number,
    paused: boolean,
    finished: boolean,
    requiredAttempts: number,
    availableAttempts: number,
    error: string | null;
    status: string;
};
type Result = ShortPostInfo & {
    dbLink: string,
    dbLarge: string,
    dbPreview: string,
    sim: number|string,
};
type SavedResult = {
    query: string,
    results: Result[],
    date: number,
    count: number,
}
export type { State, Result, SavedResult };

/**
 * Class to take pics on Danbooru and find the most similar on Anime-pictures user SauceNAO
 */
export default class Importer {
    private query: string;
    private doPause = false;
    private page = 0;
    private done = 0;
    private posts:PostInfo[] = [];
    // @ts-ignore - readable's callback is called immediately
    private saveState: Function;
    private stateObj = {
        progress: 0,
        paused: true,
        finished: false,
        error: null,
        status: "initialization",
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
            this.posts = await DB.findPosts(this.query, this.page);
            post = this.posts.pop();
            if (!post) {
                // it was the last page so save the results
                this.results.sort((a, b) => +b.sim - +a.sim);
                const res = {
                    query: decodeURIComponent(this.query),
                    results: this.results,
                    date: Date.now(),
                    count: this.results.length,
                };
                new LocalValue(`res_${res.date}`, {}).set(res);
                this.stateObj.paused = true;
                this.stateObj.finished = true;
                this.saveState();
                return;
            }
        }

        try {
            this.stateObj.status = `${this.done}/${this.stateObj.requiredAttempts}: post №${post.id}`;
            if (post.large_file_url) {
                // @ts-ignore - sometimes SauceNAO fails with post.large_file_url
                const simRes = await SN.findClosestOnAnimePictures(post.preview_file_url);
                const apPost = await AP.getPostInfo(simRes.data['anime-pictures_id']);
                if (!this.results.find(({ id }) => id === apPost.id)) {
                    this.results.push({
                        dbLink:         `https://danbooru.donmai.us/posts/${post.id}`,
                        dbLarge:        post.large_file_url,
                        dbPreview:      post.preview_file_url ?? "",
                        sim:            simRes.header.similarity,
                        id:             apPost.id,
                        md5:            apPost.md5,
                        md5_pixels:     apPost.md5_pixels,
                        width:          apPost.width,
                        height:         apPost.height,
                        small_preview:  apPost.small_preview,
                        medium_preview: apPost.medium_preview,
                        big_preview:    apPost.big_preview,
                        pubtim:         apPost.pubtim,
                        score:          apPost.score,
                        score_number:   apPost.score_number,
                        size:           apPost.size,
                        download_count: apPost.download_count,
                        erotics:        apPost.erotics,
                        color:          apPost.color,
                        ext:            apPost.ext,
                        status:         apPost.status,
                        spoiler:        apPost.spoiler,
                        have_alpha:     apPost.have_alpha,
                        tags_count:     apPost.tags_count,
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
            console.error(post, ex);
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
            try {
                this.stateObj.availableAttempts = await SN.availableAttempts();
                this.stateObj.requiredAttempts = await DB.postCount(this.query);
            } catch (ex) {
                this.stateObj.error = ex.message;
                this.saveState();
                throw ex;
            }
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
                this.stateObj.error = null;
                this.saveState();
                this.iterate();
            }
        }
        return true;
    }
}

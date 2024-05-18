import { get, sleep } from "./ajax";
import LocalValue from "../localStorage";

type Params = Record<string, string|number|undefined>;
type timestamp = string;

type BadResponse = {
    success: false,
    message: string,
    backtrace: string[],
}

type BasePostInfo = {
    created_at: timestamp, // RFC 3339 format
    uploader_id: number,
    updated_at: timestamp,
    approver_id: number|null,
    last_commented_at: timestamp|null,
    last_comment_bumped_at: timestamp|null,
    last_noted_at: timestamp|null,
    score: number,
    source: string|null,
    pixiv_id: number|null,
    rating: "g"|"s"|"q"|"e"|null,
    image_width: number,
    image_height: number,
    fav_count: number,
    file_size: number,
    parent_id: number|null,
    has_children: boolean,
    has_active_children: boolean,
    has_visible_children: boolean,
    has_large: boolean,
    tag_count: number,
    tag_count_general: number,
    tag_count_artist: number,
    tag_count_character: number,
    tag_count_copyright: number,
    tag_count_meta: number,
    tag_string: string, // all tags
    tag_string_general: string,
    tag_string_character: string,
    tag_string_copyright: string,
    tag_string_artist: string,
    tag_string_meta: string,
    pool_string: string,
    up_score: number,
    down_score: number,
    is_pending: boolean,
    is_flagged: boolean,
    is_deleted: boolean,
    is_banned: boolean,
    is_note_locked: boolean,
    is_rating_locked: boolean,
    is_status_locked: boolean,
    bit_flags: number,
}

// this info isn't provided if an anon or regular user attempts to get
// a post which is banned or tagged as loli/shota
type ExtraPostInfo =  {
    id: number,
    md5: string,
    file_ext: string,
    file_url: string, // full link to original
    large_file_url: string, // 850px width ver or original
    preview_file_url: string, // 150px of the biggest side
}

type OptionalPart<T> = T | Partial<Record<keyof T, undefined>>

type PostInfo = BasePostInfo & OptionalPart<ExtraPostInfo>;

type PostCount = {
    counts: {
        posts: number,
    }
}

export enum TagCategory {
    general = 0,
    artist = 1,
    copyright = 3,
    character = 4,
    meta = 5,
}

type AutocompleteTag = {
    type: "tag" | "tag-alias",
    /**
     * tag name with spaces
     */
    label: string,
    /**
     * tag name with underscores
     */
    value: string,
    category: TagCategory,
    post_count: number,
    /**
     * alias
     */
    antecedent?: string,
}

let dblogin: string, dbapikey: string;
new LocalValue("dbkey", "").subscribe((key) => {
    [dblogin, dbapikey] = key.split(" ");
});
/**
 * Do a request to danbooru.donmai.us
 * @param {string} path - Relative link to request
 * @param {Params} [params={}] - Request params
 * @returns {Promise<object>} Parsed server response
 */
async function danbooru<Result extends {}> (path: string, params: Params = {}): Promise<Result> {
    if (dblogin) {
        params.login = dblogin;
        params.api_key = dbapikey;
    }
    let res: BadResponse | Result;
    for (const nth of ["Second", "Third", "Fourth", "Fifth"]) {
        res = await get(`https://danbooru.donmai.us${path}`, params);

        if (!("success" in res)) return res;

        console.warn(path, params, res.message, `${nth} attempt`);
        await sleep(5000);
    }
    res = await get(`https://danbooru.donmai.us${path}`, params);
    if (!("success" in res)) return res;
    throw new Error(res?.message);
}

const Danbooru = {
    /**
     * Does autocomplete request
     * @param tagName - the tag to complete
     * @param type - type of completion, default `"tag_query"`
     * @returns array of matched tags
     */
    autocompleteTag (tagName: string, type = "tag_query") {
        return danbooru<AutocompleteTag[]>("/autocomplete.json", {
            "search[query]": tagName,
            "search[type]": type,
            version: "1",
            limit: "10",
        });
    },
    /**
     * Get number of posts for a given search query
     * @param query - Search query
     * @returns Number of posts
     */
    async postCount (tags: string) {
        return (await danbooru<PostCount>("/counts/posts.json", { tags })).counts.posts;
    },
    /**
     * Get post infos
     * @param tags - Query to search the posts
     * @param page - Page number of results
     * @param limit - Max number of results per page
     * @returns Array of post infos
     */
    findPosts (tags: string, page: number = 1, limit?: number) {
        return danbooru<PostInfo[]>("/posts.json", { tags, page, limit });
    },
};

export default Danbooru;
export type { PostInfo };

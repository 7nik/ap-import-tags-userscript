import { get, sleep } from "./ajax";
import LocalValue from "../localStorage";
    
type Params = Record<string, string|number>;
type timestamp = string;

type DanbooruBadResponse = {
    success: false,
    message: string,
    backtrace: string[],
}

type DanbooruPostInfo = {
    id?: number, // in case loli/shota is hidden for anons and regular users
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
    md5?: string, // same case as with id
    rating: "s"|"q"|"e"|null,
    image_width: number,
    image_height: number,
    fav_count: number,
    file_ext?: string, // same
    file_size: number,
    file_url?: string, // full link to original; same case as with id
    large_file_url?: string, // 850px width or original; same
    preview_file_url?: string, // 150px biggest side; same
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

type DanbooruPostCount = {
    counts: {
        posts: number,
    }
}

type DBRespType<path> = 
    path extends "/counts/posts.json" ? DanbooruPostCount :
    path extends "/posts.json" ? DanbooruPostInfo[] :
    never;

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
async function danbooru<Path extends string> (path: Path, params: Params = {}): Promise<DBRespType<Path>> {
    if (dblogin) {
        params.login = dblogin;
        params.api_key = dbapikey;
    }
    let res: DanbooruBadResponse | DBRespType<Path>;
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
     * Get number of posts for a given search query
     * @param {string} query - Search query 
     * @returns {Promise<number>} Number of posts
     */
    async postCount (tags: string): Promise<number> {
        return (await danbooru("/counts/posts.json", { tags })).counts.posts;
    },
    /**
     * Get post infos
     * @param {string} tags - Query to search the posts
     * @param {number} page - Page number of results  
     * @returns {Promise<DanbooruPostInfo[]>} Array of post infos
     */
    findPosts (tags: string, page: number = 1): Promise<DanbooruPostInfo[]> {
        return danbooru("/posts.json", { tags, page });
    },
};

export default Danbooru;
export type { DanbooruPostInfo };

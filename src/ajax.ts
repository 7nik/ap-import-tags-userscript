import LocalValue from "./localStorage.js";
    
type Params = { [k:string]: string|number };
type textNumber = string; // number presented as string
type timestamp = string;

type AnimePicturesPostInfo = {
    id: number,
    md5: string,
    md5_pixels: string,
    width: number,
    heiht: number,
    small_preview: string, // 150px bigger side
    medium_preview: string, // 300px bigger side
    big_preview: string, // 600px bigger side
    pubtim: timestamp, // YMDHMSw.d format,
    score: number, // deprecated?
    score_number: number, // star number
    size: number, // file size
    download_count: number,
    erotics: 0|1|2|3, // no erotic, light erotic, [medium] erotic, hard erotic
    color: [number, number, number], // average color, RGB format
    ext: ".jpg"|".png"|".gif",
    status: 0|-2|1|2, // new|pre|published|banned
    spoiler: boolean, // presense of the spoiler tag
    have_alpha: boolean, // presence the alpha channel?
    tags_count: number,
    user_name: string, // uploader
    user_id: number, // uploader
    user_avatar: string, // uploader avatar
    tags: string[], // tags in current language
    tags_full: { name: string, type: number, num: number }[], 
    file_url: string, // link to full image
    star_it: boolean, // whether you stared it
    is_favorites: boolean, // whether you favorited it
    favorite_folder: "", 
    user_favorite_folders: string[],
};

type DanbooruBadResponse = {
    success: boolean,
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
    file_url?: string, // full, same case as with id
    large_file_url?: string, // same
    preview_file_url?: string, // same
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

type SauceNaoResult = {
    header: {
        similarity: textNumber,
        thumbnail: string, // full link
        index_id: number,
        index_name: string,
        dupes: number,
    }
    data: {
        ext_urls: string[]
    }
}
type SnrHMagazines = SauceNaoResult & {
    header: { index_id: 0 },
    data: {
        title: string,
        part: string,
        data: string,
    }
}
type SnrHGameCG = SauceNaoResult & {
    header: { index_id: 2 },
    data: {
        title: string,
        company: string,
        getch_id: textNumber,
    }
}
type SnrPixiv = SauceNaoResult & {
    header: { index_id: 5|6|51|52|53 },
    data: {
        title: string,
        pixiv_id: number,
        member_name: string,
        member_id: number,
    }
}
type SnrNicoNicoSeiga = SauceNaoResult & {
    header: { index_id: 8 },
    data: {
        title: string,
        seiga_id: number,
        member_name: string,
        member_id: number,
    }
}
type SnrDanbooru = SauceNaoResult & {
    header: { index_id: 9 },
    data: {
        danbooru_id: number,
        creator: string,
        material: string,
        character: string,
        source: string,
    }
}
type SnrDrawrImages = SauceNaoResult & {
    header: { index_id: 10 },
    data: {
        drawr_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type SnrNijieImages = SauceNaoResult & {
    header: { index_id: 11 },
    data: {
        nijie_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type SnrYandere = SauceNaoResult & {
    header: { index_id: 12 },
    data: {
        yandere_id: number,
        creator: string,
        material: string,
        character: string,
        source: string,
    }
}
type SnrFakku = SauceNaoResult & {
    header: { index_id: 16 },
    data: {
        creator: string,
        source: string,
    }
}
type SnrHMisc = SauceNaoResult & {
    header: { index_id: 18 },
    data: {
        creator: string[],
        source: string,
        eng_name: string,
        jp_name: string,
    }
}
type Snr2DMarket = SauceNaoResult & {
    header: { index_id: 19 },
    data: {
        creator: string[],
        source: string,
    }
}
type SnrMediBand = SauceNaoResult & {
    header: { index_id: 20 },
    data: {
        title: string,
        url: string,
        member_name: string,
        member_id: number,
    }
}
type SnrAnidb = SauceNaoResult & {
    header: { index_id: 21|211|22 },
    data: {
        source: string,
        anidb_aid: number,
        part: string,
        year: string,
        est_time: string,
    }
}
type SnrImdb = SauceNaoResult & {
    header: { index_id: 23|24 },
    data: {
        source: string,
        imdb_id: number,
        part?: string,
        year: string,
        est_time: string,
    }
}
type SnrGelbooru = SauceNaoResult & {
    header: { index_id: 25 },
    data: {
        gelbooru_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrKonachan = SauceNaoResult & {
    header: { index_id: 26 },
    data: {
        konachan_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrSankakuChan = SauceNaoResult & {
    header: { index_id: 27 },
    data: {
        sankaku_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrAnimePictures = SauceNaoResult & {
    header: { index_id: 28 },
    data: {
        "anime-pictures_id": number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrE621 = SauceNaoResult & {
    header: { index_id: 29 },
    data: {
        e621_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrSankakuIdol = SauceNaoResult & {
    header: { index_id: 30 },
    data: {
        idol_id: number,
        creator: string,
        material: string,
        characters: string,
        source: string,
    }
}
type SnrBcy = SauceNaoResult & {
    header: { index_id: 31|32 },
    data: {
        bcy_id: number,
        title: string,
        member_name: string,
        member_id: number,
        member_link_id: number,
        bcy_type: string,
    }
}
type SnrPortalGraphics = SauceNaoResult & {
    header: { index_id: 33 },
    data: {
        pg_id: number,
        title: string,
        member_name: string,
        member_id: number,
    }
}
type SnrDeviantArt = SauceNaoResult & {
    header: { index_id: 34|341 },
    data: {
        da_id: number,
        title: string,
        author_name: string,
        author_url: string,
    }
}
type SnrPawoo = SauceNaoResult & {
    header: { index_id: 35 },
    data: {
        pawoo_id: number,
        pawoo_user_acct: string,
        pawoo_user_username: string,
        pawoo_user_display_name: string,
        created_at: timestamp,
    }
}
type SnrMangaUpdates = SauceNaoResult & {
    header: { index_id: 36 },
    data: {
        mu_id: number,
        source: string,
        part: string,
        type: string,
    }
}
type SnrMangaDex = SauceNaoResult & {
    header: { index_id: 37 },
    data: {
        md_id: number,
        source: string,
        part: string,
        artist: string,
        author: string,
    }
}
type SnrEHentai = SauceNaoResult & {
    header: { index_id: 38 },
    data: {
        source: string,
        creator: string[],
        eng_name: string,
        jp_name: string,
    }
}
type SnrArtStation = SauceNaoResult & {
    header: { index_id: 39 },
    data: {
        title: string,
        as_project: string,
        author_name: string,
        author_url: string,
    }
}
type SnrFurAffinity = SauceNaoResult & {
    header: { index_id: 40 },
    data: {
        fa_id: number,
        title: string,
        author_name: string,
        author_url: string,
    }
}
type SnrTwitter = SauceNaoResult & {
    header: { index_id: 41 },
    data: {
        created_at: string,
        tweet_id: string,
        twitter_user_id: string,
        twitter_user_handle: string,
    }
}
type SnrFurryNetwork = SauceNaoResult & {
    header: { index_id: 42 },
    data: {
        fn_id: number,
        fn_type: string,
        title: string,
        author_name: string,
        author_url: string,
    }
}

type SauceNaoError = {
    header: {
        user_id?: textNumber,
        account_type?: textNumber,
        short_limit?: textNumber,
        long_limit?: textNumber,
        long_remaining?: number,
        short_remaining?: number,
        results_requested?: number,
        // in case anon error or run out error only these two field presented
        status: -1, // in fact can be any non-zero value
        message: string, // error message
    }
}
type SauceNaoResults = {
    header: {
        user_id: textNumber,
        account_type: textNumber,
        short_limit: textNumber,
        long_limit: textNumber,
        long_remaining: number,
        short_remaining: number,
        status: 0,
        index: {
            [k:string]: {
                status: number,
                id: number,
                parent_id: number,
                results: number,
            }
        }
        search_depth: textNumber,
        minimum_similarity: number,
        query_image_display: string, // relative link to the searched image
        query_image: string,
        results_requested: number,
        results_returned: number,
    }
    results: (SnrHMagazines|SnrHGameCG|SnrPixiv|SnrNicoNicoSeiga|SnrDanbooru|
        SnrDrawrImages|SnrNijieImages|SnrYandere|SnrFakku|SnrHMisc|Snr2DMarket|
        SnrMediBand|SnrAnidb|SnrImdb|SnrGelbooru|SnrKonachan|SnrSankakuChan|
        SnrAnimePictures|SnrE621|SnrSankakuIdol|SnrBcy|SnrPortalGraphics|
        SnrDeviantArt|SnrPawoo|SnrMangaUpdates|SnrMangaDex|SnrEHentai|SnrArtStation|
        SnrFurAffinity|SnrTwitter|SnrFurryNetwork)[],
}

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

/**
 * A fetch-like functoin that work over GM.XHR
 * @param {string} url - Full URL of the request 
 * @param {Params} params - Other params of the function 
 * @returns {Promise<Response>} Response object of the same type as fetch's
 */
async function gmFetch (url: string, params: Params = {}): Promise<Response> {
    let resolveResp, rejectResp;
    const respPromise: Promise<GM.Response<any>> = new Promise((res, rej) => {
        resolveResp = res; 
        rejectResp = rej; 
    });
    await GM.xmlHttpRequest({
        url, 
        method: "GET", 
        // @ts-ignore - the used types are a bit outdated
        responseType: "arraybuffer",
        onload: resolveResp,
        onabort: rejectResp,
    });
    try {
        const resp = await respPromise;
        return new Response(resp.response, {
            status: resp.status, statusText: resp.statusText
        });
    } catch (resp) {
        throw new Error(resp);
    }
}

/**
 * Does network query and re-attempts up to five times
 * @param {string} url - Full URL of the request 
 * @param {Params} [params={}] - Get-params of the request 
 * @returns {Promise<Response>} Raw server response
 */
async function ajax (url: string, params: Params = {}, useGMXHR = false): Promise<Response> {
    const link = new URL(url);
    Object.entries(params).forEach(
        ([key, value]) => link.searchParams.append(key, value.toString())
    );
    for (const nth of ["Second", "Third", "Fourth", "Fifth"]) {
        try {
            return await (useGMXHR ? gmFetch : fetch)(link.toString());
        } catch (ex) {
            console.warn(ex, link.href, `\nFetch error. ${nth} attempt`);
            await sleep(5000);
        }
    }
    // do not mute exception at the last attempt
    return await (useGMXHR ? gmFetch : fetch)(link.toString());
};

/**
 * Do a request to Anime-Pictures.net
 * @param {string} path - Relative link to request 
 * @param {Params} [params={}] - Request params 
 * @returns {Promise<object>} Parsed server response
 */
async function animepictures (path: string, params: Params = {}): Promise<object> {
    const resp = await ajax(`https://anime-pictures.net${path}`, {
        lang: "en",
        type: "json",
        ...params,
    });
    if (!resp.ok) throw resp;
    return resp.json();
};

const AnimePictures = {
    /**
     * Get post info by id
     * @param {number|string} postId - Post id 
     * @returns {Promise<AnimePicturesPostInfo>} Post info
     */
    getPostInfo (postId: number|string): Promise<AnimePicturesPostInfo> {
        return animepictures(`/pictures/view_post/${postId}`) as Promise<AnimePicturesPostInfo>;
    },
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
async function danbooru (path: string, params: Params = {}): Promise<object> {
    if (dblogin) {
        params.login = dblogin;
        params.api_key = dbapikey;
    }
    let res: DanbooruBadResponse;
    for (const nth of ["Second", "Third", "Fourth", "Fifth"]) {
        res = await ajax(`https://danbooru.donmai.us${path}`, params)
            .then(resp => resp.json());

        if (res.success || !("success" in res)) return res;

        console.warn(path, params, res.message, `${nth} attempt`);
        await sleep(5000);
    }
    res = await ajax(`https://danbooru.donmai.us${path}`, params)
        .then(resp => resp.json());
    if (res.success || !("success" in res)) return res;
    throw new Error(res?.message);
};

const Danbooru = {
    /**
     * Get number of posts for a given search query
     * @param {string} query - Search query 
     * @returns {Promise<number>} Number of posts
     */
    async postCount (tags: string): Promise<number> {
        const res = (await danbooru("/counts/posts.json", { tags }));
        return (res as DanbooruPostCount).counts.posts;
    },
    /**
     * Get post infos
     * @param {string} tags - Query to search the posts
     * @param {number} page - Page of results  
     * @returns {Promise<DanbooruPostInfo[]>} Array of post infos
     */
    findPosts (tags: string, page: number = 1): Promise<DanbooruPostInfo[]> {
        return danbooru("/posts.json", { tags, page }) as Promise<DanbooruPostInfo[]>;
    },
}

let snapikey: string;
new LocalValue("snkey", "").subscribe((key) => {
    snapikey = key;
});
/**
 * Do search on SauceNAO
 * @param {Params} params - Params of the search (url, numres, db, dbmask, dbmaski, dedupe) 
 * @returns {Promise<SauceNaoResults} Found pictures
 */
async function saucenao (params: Params = {}): Promise<SauceNaoResults> {
    let res: SauceNaoError | SauceNaoResults;
    for (let i = 0; i < 5; i++) {
        res = await ajax("https://saucenao.com/search.php", {
            output_type: 2,
            api_key: snapikey,
            ...params,
        }, true).then(resp => resp.json());

        if (res.header.status === 0) {
            await sleep(res.header.short_remaining > 3 ? 1400 : 10000);
            return res as SauceNaoResults;
        }

        const { message, status, short_remaining = 0, long_remaining = 0 } = res.header;
        console.warn("Replanishing:", { message, status, short_remaining, long_remaining });
        await sleep(31000);
    }
    throw new Error("Run out of search attempts");
};

const SauceNAO = {
    /**
     * Find the most similar picture to a given one on Anime-Pictures
     * @param {string} url - Picture to search 
     * @returns {Promise<SnrAnimePictures>} The best match
     */
    async findClosestOnAnimePictures (url: string): Promise<SnrAnimePictures> {
        const res = await saucenao({ url, db: 28, numres: 1 });
        return res.results[0] as SnrAnimePictures;
    },
    /**
     * Get number of avaivable daily attempts to search (cost 1 attempt)
     * @returns {Promse<number>} Number of remaining daily attempts
     */
    async availableAttempts (): Promise<number> {
        return (await saucenao({ url: "https://saucenao.com/images/static/banner_large.gif" }))
            .header.long_remaining;
    },
};

export { AnimePictures, Danbooru, SauceNAO };

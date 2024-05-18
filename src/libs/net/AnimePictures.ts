import { del, get, post } from "./ajax";

type FullUrl = `https://${string}` | `//${string}`;

type timestamp = string;

type UserInfo = {
    id: number,
    name: string,
    avatar_version: number,
    isavatar: boolean,
    site_score: number,
    groups: string[],
    age: number,
    gender: number,
    register_date: timestamp,
}

type ShortPostInfo = {
    id: number,
    md5: string,
    md5_pixels: string,
    width: number,
    height: number,
    small_preview: string, // 150px bigger side
    medium_preview: string, // 300px bigger side
    big_preview: string, // 600px bigger side
    pubtime: timestamp, // YMDHMSw.d format,
    datetime: timestamp, // YMDHMSw.d format,
    score: number, // deprecated?
    score_number: number, // star number
    size: number, // file size
    download_count: number,
    erotics: 0|1|2|3, // no erotic, light erotic, [medium] erotic, hard erotic
    color: [number, number, number], // average color, RGB format
    ext: ".jpg"|".jpeg"|".png"|".gif",
    status: 0|-2|1|2, // new|pre|published|banned
    status_type: number,
    redirect_id: number|null,
    spoiler: boolean, // presense of the spoiler tag
    have_alpha: boolean, // presence the alpha channel
    tags_count: number,
}

type PostInfo = {
    post: ShortPostInfo,
    user: UserInfo,
    moderator: UserInfo,
    tags: {
        tag: {
            id: number,
            tag: string,
            tag_ru: string|null,
            tag_jp: string|null,
            num: number,
            num_pub: number,
            type: number,
            alias: number|null,
            parent: number|null,
            views: number,
        },
        user: UserInfo,
        relation: {
            addtime: timestamp,
            removetime: timestamp|null,
            user_id: number,
            moderator_id: number|null,
            s_x1: number|null,
            s_y1: number|null,
            s_x2: number|null,
            s_y2: number|null,
        },
    }[],
    file_url: string, // filename
    position: number|null,
    star_it: boolean, // whether you stared it
    favorite_users: {
        user: UserInfo,
        favorite: {
            id: number,
            juser_id: number,
            post: number,
            addtime: timestamp,
            folder: string|null,
        }
    }[],
    tied: ShortPostInfo[],
    favorite_folder: "",
    user_favorite_folders: string[],
}

export enum TagCategory {
    unknown = 0,
    character = 1,
    reference = 2,
    product_copyright = 3,
    author = 4,
    game_copyright = 5,
    other_copyright = 6,
    object = 7,
    meta = 8,
}

type FullTag = {
    id: number,
    tag: string, // tag name
    tag_ru: string | null,
    tag_jp: string | null,
    num: number, // number of posts with this tag
    num_pub: number, // number public posts
    type: TagCategory,
    description_en: string,
    description_ru: string,
    description_jp: string,
    alias: number | null, // whether it's alias and to whom
    parent: number | null, // whether it's a child and whos
    views: number, // now this counter is disabled
}

type TagSearchResult = {
    success: boolean,
    offset: number,
    limit: number,
    tags: FullTag[],
}

type GetTagResult = {
    success: boolean,
    tag: FullTag,
}

type PostHtmlTags = {
    success: boolean,
    post_tags: string, // HTML of <ul.tags> elem with all post tags
}

type AutocompleteTag = {
    c: TagCategory, // tag category
    id: number, // tag id
    t: string, // tag name where the matched part is wrapped by `<b>`
    t2: string | null, // if it's alias, main tag
}

type AutocompleteTagResult = {
    tags_list: AutocompleteTag[],
}

type SearchPostsResultRaw = {
    exclusive_tag: FullTag | null, // if searched by one tag, contains the tag
    posts_per_page: number, // max posts per page
    response_posts_count: number, // length of `posts`
    page_number: number, // current page number
    posts: ShortPostInfo[],
    posts_count: number, // approximate total number of posts
    max_pages: number, // number of the last page
}

type SearchPostsResult = {
    searchedTag: FullTag | null, // if searched by one tag, contains the tag
    currentPage: number, // current page number
    posts: ShortPostInfo[],
    totalPosts: number, // approximate total number of posts
    totalPages: number, // total number of the pages
}

type Environment = {
    js_cdn_host: FullUrl,
    images_preview_json_host: FullUrl,
    images_preview_host: FullUrl,
    style_cdn_host: FullUrl,
    static_host: FullUrl,
    country_iso_code: string,
    avatar_host: FullUrl,
    lang: string,
    site_theme: string,
    erotics_block: boolean,
    moderator: boolean,
    login: boolean,
    monitored_tags: [],
}

type User = {
    id: number,
    name: string,
    avatar_version: number,
    isavatar: boolean,
    site_score: number,
    groups: string[],
    age: number,
    gender: number,
    register_date: timestamp,
    enable: boolean,
    email: string,
    upload_limit: number
}

type UserItself = User & {
    login: string,
    openid: boolean,
    jvwall_block_erotic: boolean,
    enable_spoilers: boolean,
    small_preview: boolean,
    unproven_pictures: number,
    birthday: timestamp,
    jvwall_ipp: number,
    jvwall_ionw: boolean,
    last_view_jvwall: timestamp,
    new_messages_count: number,
    count_new_images_for_user: number,
    favorite_folders: string[],
    denied_tags: string,
}

type ProfileResult = {
    env: Environment,
    success: boolean,
    user: UserItself,
}

const HOST = "https://api.anime-pictures.net";

const AnimePictures = {
    /**
     * Add tags to a post
     * @param tagNames - list of tags separated by `||`
     * @param postId - Id of the post
     * @param createTags - allow creating of new tags, requires moderator rights
     * @return HTML of ul.tags element
     */
    async addTags (tagNames: string, postId: number, createTags: boolean = false): Promise<string> {
        const res: PostHtmlTags = await post(
            `${HOST}/api/v3/posts/${postId}/tags`,
            { query: tagNames, add_new_tag: createTags },
        );
        return res.post_tags;
    },
    /**
     * Does a search by part of tag name
     * @param tagName - partial or full tag name
     * @returns matched tags
     */
    async autocompleteTag (tagName: string): Promise<AutocompleteTag[]> {
        const res: AutocompleteTagResult = await post(`${HOST}/pictures/autocomplete_tag`, {
            tag: tagName,
        });
        return res.tags_list;
    },
    /**
     * Get post info by id
     * @param postId - post id
     * @returns post info
     */
    getPostInfo (postId: number|string): Promise<PostInfo> {
        return get(`${HOST}/api/v3/posts/${postId}`, {
            lang: "en",
            type: "json",
        });
    },
    /**
     * Get tag info by its Id
     * @param tagId - Id of the tag
     * @return tag info
     */
    async getTagById (tagId: number): Promise<FullTag> {
        const res: GetTagResult = await get(`${HOST}/api/v3/tags/${tagId}`);
        if (res.tag.alias) {
            return this.getTagById(res.tag.alias);
        }
        return res.tag;
    },
    /**
     * Find a tag by given name in any language
     * @param tagName - name of tag to search
     * @returns tag info
     */
    async getTagByName (tagName: string): Promise<FullTag> {
        tagName = encodeURIComponent(tagName.toLowerCase());
        const res: TagSearchResult = await get(`${HOST}/api/v3/tags?tag:smart=${tagName}`);
        if (res.tags.length > 1) {
            console.warn("Found multipe tags of", tagName, res.tags);
        }
        if (!res.tags[0]) return res.tags[0];
        // if it's an alias, return the main tag
        if (res.tags[0].alias) {
            return await this.getTagById(res.tags[0].alias);
        }
        return res.tags[0];
    },
    /**
     * Search posts
     * @param pageNum - Number of a page result
     * @param params - Option of the search
     * @return - JSON response
     */
    async searchPosts (
        pageNum: number,
        params: Partial<{
            searchTags: string, // search query
            excludeTags: string, // tags to exclude
            favoriteBy: number, // favored by given user
            favoriteFolder: string, // folder name, requires `favoriteBy`
            width: number, // image width
            height: number, // image height
            wider: boolean, // if set: true: >=width, false: <=width; requires `width`
            taller: boolean, // if set: true: >=height, false: <=height; requires `height`
            aspectRatio: number | string, // number (e.g. 1.78) or fraction (e.g. "3:4")
            order: "date"|"dateRev"|"stars"|"views"|"fileSize"|"tagNum",
            maxAge: "off"|"1w"|"1m"|"1d"|"6m"|"1y"|"2y"|"3y",
            smallPreview: boolean, // affects only original UI
            excludeModerImages: boolean, // exclude moderator's images
            jpgImages: boolean, // only jpeg
            pngImages: boolean, // only png
            gifImages: boolean, // only gif
            imageColor: [number, number, number], // average color of image
            imageColorDeviation: number, // deviation of the image color
            since: number, // post published since given date
            uploaderId: number, // filter by uploader
            preStatus: boolean, // `pre` or nothing
            staredBy: number, // posts starred by given user
        }>,
    ): Promise<SearchPostsResult> {
        const queryParams: Record<string, number|string|null|undefined> = {
            page: pageNum,
            search_tag: params.searchTags,
            denied_tags: params.excludeTags,
            favorite_by: params.favoriteBy,
            favorite_folder: params.favoriteFolder,
            res_x: params.width,
            res_y: params.height,
            res_x_n: params.wider ? 1 : params.wider === false ? 0 : null,
            res_y_n: params.taller ? 1 : params.taller === false ? 0 : null,
            aspect: params.aspectRatio,
            order_by: {
                date: "date",
                dateRev: "date_r",
                stars: "rating",
                views: "views",
                fileSize: "size",
                tagNum: "tag_num",
                default: null,
            }[params.order ?? "default"],
            ldate: {
                off: 0,
                "1w": 1,
                "1m": 2,
                "1d": 3,
                "6m": 4,
                "1y": 5,
                "2y": 6,
                "3y": 7,
                default: null,
            }[params.maxAge ?? "default"],
            small_prev: params.smallPreview ? 1 : null,
            dmi: params.excludeModerImages ? 1 : null,
            ext_jpg: params.jpgImages ? "jpg" : null,
            ext_png: params.pngImages ? "png" : null,
            ext_gif: params.gifImages ? "gif" : null,
            color: params.imageColor
                ? params.imageColor.concat(params.imageColorDeviation ?? 150).join("_")
                : null,
            view_after: params.since,
            user: params.uploaderId,
            status: params.preStatus ? "pre" : null,
            stars_by: params.staredBy,
            // @ts-ignore
            lang: "",
        };
        Reflect.ownKeys(queryParams).forEach((key) => {
            if (queryParams[key as string] == null) delete queryParams[key as string];
        })
        const res: SearchPostsResultRaw = await get(`${HOST}/api/v3/posts`, queryParams as Record<string, string>);
        return {
            searchedTag: res.exclusive_tag,
            currentPage: res.page_number,
            posts: res.posts,
            totalPosts: res.posts_count,
            totalPages: res.max_pages + 1,
        };
    },
    /**
     * Delete a tag from a post, requires rights base on post status:
     * NEW - uploader or moderator;
     * PRE - any active member;
     * Public, Banned - moderator only.
     * @param tagId - Tag Id to remove
     * @param postId - Post Id
     * @return - JSON response
     */
    async removeTag (tagId: number, postId: number): Promise<string> {
        const res: PostHtmlTags = await del(
            `${HOST}/api/v3/posts/${postId}/tags/${tagId}`
        );
        return res.post_tags;
    },
    /**
     * Retrieves various user's data and settings
     * @returns JSON response
     */
    async userData (): Promise<ProfileResult> {
        return await get(`${HOST}/api/v3/profile`);
    }
};

export default AnimePictures;
export type { PostInfo, ShortPostInfo, FullTag, AutocompleteTag };

import { get, post } from "./ajax";
    
type timestamp = string;

type PostInfo = {
    id: number,
    md5: string,
    md5_pixels: string,
    width: number,
    height: number,
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
    ext: ".jpg"|".jpeg"|".png"|".gif",
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
}

type FullTag = {
    id: number,
    tag: string, // tag name
    tag_ru: string | null,
    tag_jp: string | null,
    num: number, // number of posts with this tag
    num_pub: number, // number public posts
    type: 0|1|2|3|4|5|6|7,
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
    c: number, // tag category
    id: number, // tag id
    t: string, // tag name where the matched part is wrapped by `<b>`
    t2: string | null, // if it's alias, main tag
}

type AutocompleteTagResult = {
    tags_list: AutocompleteTag[],
}

const AnimePictures = {
    /**
     * Add tags to a post
     * @param  {string} tagNames - List of tags separated by `||` 
     * @param  {(number|string)} postId - Id of the post
     * @param  {Boolean} createTags - Allow creating of new tags, requires moderator rights
     * @return {Promise<string>} - HTML of ul.tags element
     */
    async addTags (tagNames: string, postId: number, createTags: boolean = false): Promise<string> {
        const res: PostHtmlTags = await post( 
            `https://anime-pictures.net/pictures/add_tag_to_post/${postId}`,
            { text: tagNames, add_new_tag: createTags.toString() },
        );
        return res.post_tags;
    },
    /**
     * Does a search by part of tag name
     * @param {string} tagName - Partial or full tag name
     * @returns {Promise<AutocompleteTag[]>} - Matched tags
     */
    async autocompleteTag (tagName: string): Promise<AutocompleteTag[]> {
        const res: AutocompleteTagResult = await post("https://anime-pictures.net/pictures/autocomplete_tag", {
            tag: tagName,
        });
        return res.tags_list;
    },
    /**
     * Get post info by id
     * @param {number|string} postId - Post id 
     * @returns {Promise<PostInfo>} Post info
     */
    getPostInfo (postId: number|string): Promise<PostInfo> {
        return get(`https://anime-pictures.net/pictures/view_post/${postId}`, {
            lang: "en",
            type: "json",
        });
    },
    /**
     * Get tag info by its Id
     * @param  {number} tagId - Id of the tag
     * @return {Promise<FullTag>} Tag info
     */
    async getTagById (tagId: number): Promise<FullTag> {
        const res: GetTagResult = await get(
            `https://anime-pictures.net/api/v3/tags/${tagId}`,
        );
        if (res.tag.alias) {
            return this.getTagById(res.tag.alias);
        }
        return res.tag;
    },
    /**
     * Find a tag by given name in any language
     * @param {string} tagName - name of tag to search 
     * @returns {Promise<FullTag>} Tag info
     */
    async getTagByName (tagName: string): Promise<FullTag> {
        tagName = encodeURIComponent(tagName.toLowerCase());
        const res: TagSearchResult = await get(
            `https://anime-pictures.net/api/v3/tags?tag:smart=${tagName}`,
        );
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
     * Delete a tag from a post, requires rights base on post status:
     * NEW - uploader or moderator;
     * PRE - any active member;
     * Public, Banned - moderator only.
     * @param  {(number|string)} tagId - Tag Id to remove
     * @param  {(number|string)} postId - Post Id
     * @return {Promise<string>} - JSON response
     */
    async removeTag (tagId: number, postId: number): Promise<string> {
        const res: PostHtmlTags = await post(
            `/pictures/del_tag_from_post/${postId}`,
            { tag_id: tagId },
        );
        return res.post_tags;
    },
};

export default AnimePictures;
export type { PostInfo, FullTag, AutocompleteTag };

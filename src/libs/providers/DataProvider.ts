export enum Auth {
    none = "none",
    optional = "optional",
    desired = "desired",
    required = "required",
}

export interface FoundPost<Post> {
    post: Post;
    progress: number; // from 0 to 1
}

export interface SimplePost {
    id: number;
    md5: string;
    /**
     * file extension without the dot
     */
    ext: string;
}

export enum TagCategory {
    artist,
    copyright,
    character,
    general,
    meta,
}

export interface MatchedTag {
    /** Tag name matched with the query, words are space delimited */
    matchedName: string;
    /** The main tag name, words are space delimited */
    mainName: string;
    category: TagCategory;
}

export type DataProvider<RawPost, SavedPost extends SimplePost> = {
    readonly sourceName: string;
    readonly authType: Auth;
    readonly helpInfo: string;
    readonly tagPrefixes: string[];
    postCount(query: string): Promise<number>;
    /**
     * Returns an iterator over posts for provided query.
     * The next method can accept `false` to try fetch the same post again.
     * @param query which posts to search
     */
    findPosts(query: string): AsyncIterableIterator<FoundPost<RawPost>>;
    /**
     * Returns a link to the preview for the post of the given size.
     * @param post
     * @param size
     */
    getImage(post: SavedPost, size: "150" | "300" | "500"): string;
    getLink(post: SavedPost): string;
    simplifyPost(post: RawPost): SavedPost;
    autocompleteTag(query: string): Promise<MatchedTag[]>;
};

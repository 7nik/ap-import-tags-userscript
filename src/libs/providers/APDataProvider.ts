import AP, { type ShortPostInfo, TagCategory as APCategory } from "../net/AnimePictures";
import { type DataProvider, Auth, type SimplePost, TagCategory } from "./DataProvider";

type SimpleAPPost = SimplePost &
    Pick<
        ShortPostInfo,
        "md5" | "height" | "width" | "color" | "status" | "erotics" | "tags_count"
    > & { alpha: boolean };

type APDataProvider = Omit<DataProvider<ShortPostInfo, SimpleAPPost>, "simplifyPost"> & {
    simplifyPost(post: ShortPostInfo): SimpleAPPost;
};

const TAG_CATEGORY: Record<APCategory, TagCategory> = {
    [APCategory.author]: TagCategory.artist,
    [APCategory.character]: TagCategory.character,
    [APCategory.game_copyright]: TagCategory.copyright,
    [APCategory.meta]: TagCategory.meta,
    [APCategory.object]: TagCategory.general,
    [APCategory.other_copyright]: TagCategory.copyright,
    [APCategory.product_copyright]: TagCategory.copyright,
    [APCategory.reference]: TagCategory.general,
    [APCategory.unknown]: TagCategory.general,
};

function convertQuery(query: string) {
    const search: string[] = [];
    const exclude: string[] = [];

    for (let tag of query.split(",")) {
        tag = tag.trim();
        if (tag.startsWith("-")) {
            exclude.push(tag.slice(1));
        } else {
            search.push(tag);
        }
    }

    return {
        searchTags: search.join("&&"),
        excludeTags: exclude.join("||"),
    };
}

const dataProvider: APDataProvider = {
    sourceName: "AnimePictures",
    authType: Auth.desired,
    helpInfo: `Prefix tags with "-" exclude them from search results`,
    tagPrefixes: ["-"],
    async postCount(query) {
        const res = await AP.searchPosts(0, convertQuery(query));
        return res.totalPosts;
    },
    async *findPosts(query) {
        let found = 0;
        let posts: ShortPostInfo[];
        let totalPages = Infinity;
        let totalPosts = Infinity;

        for (let page = 0; page < totalPages; page += 1) {
            // eslint-disable-next-line no-await-in-loop
            ({ posts, totalPages, totalPosts } = await AP.searchPosts(page, convertQuery(query)));
            for (const post of posts) {
                found += 1;
                yield { post, progress: found / totalPosts };
            }
        }
    },
    getImage({ md5, ext, alpha }, size) {
        if (size === "orig") {
            return `https://oimages.anime-pictures.net/${md5.slice(0, 3)}/${md5}.${ext}`;
        }
        const host = `https://opreviews.anime-pictures.net/`;
        const name = `${md5.slice(0, 3)}/${md5}_`;
        // animated images
        if (ext === "gif" && (size === "500" || size === "800")) {
            // there is no lp version
            return `${host}/${name}bp.mp4`;
        }
        const s = {
            150: "sp",
            300: "cp",
            500: "bp",
            800: "lp",
        }[size];
        const ext1 = ext === "gif" ? ".gif" : alpha ? ".png" : ".jpg";
        const ext2 = ext === "gif" ? ".webp" : ".avif";
        return [host, name, s, ext1, ext2].join("");
    },
    getLink(post) {
        return `https://anime-pictures.net/posts/${post.id}`;
    },
    simplifyPost(post): SimpleAPPost {
        return {
            id: post.id,
            color: post.color,
            erotics: post.erotics,
            height: post.height,
            md5: post.md5,
            status: post.status,
            tags_count: post.tags_count,
            width: post.width,
            ext: post.ext.slice(1),
            alpha: post.have_alpha,
        };
    },
    async autocompleteTag(query) {
        const tags = await AP.autocompleteTag(query);
        return tags.map((tag) => ({
            mainName: tag.t2 ?? tag.t.replace("<b>", "").replace("</b>", ""),
            matchedName: tag.t.replace("<b>", "").replace("</b>", ""),
            category: TAG_CATEGORY[tag.c],
        }));
    },
};

export default dataProvider;
export type { SimpleAPPost };

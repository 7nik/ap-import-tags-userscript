import AP, { type ShortPostInfo, TagCategory as APCategory } from "../net/AnimePictures";
import { type DataProvider, Auth, type SimplePost, TagCategory } from "./DataProvider";

type SimpleAPPost = SimplePost &
    Pick<ShortPostInfo, "md5" | "height" | "width" | "color" | "status" | "erotics" | "tags_count">;

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
    return query
        .split(",")
        .map((q) => q.trim())
        .join("&&");
}

const dataProvider: APDataProvider = {
    sourceName: "AnimePictures",
    authType: Auth.desired,
    helpInfo: `Prefix tags with "-" exclude them from search results`,
    tagPrefixes: ["-"],
    async postCount(query) {
        const res = await AP.searchPosts(0, { searchTags: convertQuery(query) });
        return res.totalPosts;
    },
    async *findPosts(query) {
        let found = 0;
        let page = 0;
        const { posts, totalPages, totalPosts } = await AP.searchPosts(0, {
            searchTags: convertQuery(query),
        });
        for (; page < totalPages; page += 1) {
            for (const post of posts) {
                found += 1;
                yield { post, progress: found / totalPosts };
            }
            page += 1;
        }
    },
    getImage({ md5, ext }, size) {
        const host = `https://opreviews.anime-pictures.net/`;
        const name = `${md5.slice(0, 3)}/${md5}_`;
        const s = {
            150: "sp",
            300: "cp",
            500: "bp",
        }[size];
        const ext2 = ext === "gif" ? ".webp" : ".avif";
        return [host, name, s, ".", ext, ext2].join("");
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
            ext: post.ext === "gif" ? "gif" : post.have_alpha ? "png" : "jpg",
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

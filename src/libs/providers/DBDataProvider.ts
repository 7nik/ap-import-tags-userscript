import DB, { type PostInfo, TagCategory as DBCategory } from "../net/Danbooru";
import { type DataProvider, Auth, type SimplePost, TagCategory } from "./DataProvider";

type DBPost = SimplePost & { orig: string };

const TAG_CATEGORY: Record<DBCategory, TagCategory> = {
    [DBCategory.artist]: TagCategory.artist,
    [DBCategory.character]: TagCategory.character,
    [DBCategory.copyright]: TagCategory.copyright,
    [DBCategory.general]: TagCategory.general,
    [DBCategory.meta]: TagCategory.meta,
};

function convertQuery(query: string) {
    // assume it's already in danbooru's format
    if (query.includes("_")) return query;
    return query
        .split(",")
        .map((q) => q.trim().replaceAll(" ", "_"))
        .join(" ");
}

const dataProvider: DataProvider<PostInfo, DBPost> = {
    sourceName: "Danbooru",
    authType: Auth.desired,
    helpInfo: "Any Danbooru things should work here",
    tagPrefixes: ["-"],
    postCount(query) {
        return DB.postCount(convertQuery(query));
    },
    async *findPosts(query) {
        const PAGE_SIZE = 20;
        const total = await this.postCount(query);
        const lastPage = Math.ceil(total / PAGE_SIZE);
        for (let page = 1, emptyPages = 0; page <= lastPage && emptyPages < 10; page += 1) {
            // eslint-disable-next-line no-await-in-loop
            const posts = await DB.findPosts(convertQuery(query), page, 20);
            if (posts.length === 0) {
                emptyPages += 1;
            } else {
                emptyPages = 0;
            }

            for (const [i, post] of posts.entries()) {
                if (post.preview_file_url) {
                    if (post.preview_file_url.endsWith("-preview.png")) {
                        console.warn("\nNo preview", post);
                    } else {
                        yield { post, progress: ((page - 1) * PAGE_SIZE + i + 1) / total };
                    }
                } else if (post.is_banned) {
                    console.warn("\nBanned post", {
                        source: post.source,
                        main_tags: [
                            post.tag_string_copyright,
                            post.tag_string_character,
                            post.tag_string_artist,
                        ].join(" "),
                    });
                } else if (post.id) {
                    console.warn("No access to preview", post);
                } else {
                    console.warn("\nGold+ post", {
                        main_tags: [
                            post.tag_string_copyright,
                            post.tag_string_character,
                            post.tag_string_artist,
                        ].join(" "),
                    });
                }
            }
        }
    },
    getImage({ md5, ext }, size) {
        if (ext === "swf") return "https://danbooru.donmai.us/images/flash-preview.png";
        if (!md5) return "https://cdn.donmai.us/images/download-preview.png";
        if (size === "orig" && ext === "zip") {
            return `https://cdn.donmai.us/sample/${md5.slice(0, 2)}/${md5.slice(2, 4)}/sample-${md5}.webm`;
        }
        const folder = {
            150: "preview", // 180px
            300: "360x360",
            500: "720x720",
            800: "720x720",
            orig: "original",
        }[size];
        const thumbExt = {
            150: "jpg",
            300: "jpg",
            500: "webp",
            800: "webp",
            orig: ext,
        }[size];
        return `https://cdn.donmai.us/${folder}/${md5.slice(0, 2)}/${md5.slice(2, 4)}/${md5}.${thumbExt}`;
    },
    getLink({ id }) {
        return `https://danbooru.donmai.us/posts/${id}`;
    },
    simplifyPost(post) {
        return {
            id: post.id ?? 1,
            md5: post.md5 ?? "",
            ext: post.file_ext ?? "",
            width: post.image_width,
            height: post.image_height,
            orig: post.file_url!,
        };
    },
    async autocompleteTag(query) {
        const tags = await DB.autocompleteTag(query.replaceAll(" ", "_"));
        return tags.map((tag) => ({
            matchedName: (tag.antecedent ?? tag.value).replaceAll("_", " "),
            mainName: tag.label,
            category: TAG_CATEGORY[tag.category] ?? 0,
        }));
    },
};

export default dataProvider;

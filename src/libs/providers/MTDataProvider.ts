import { DataProvider, Auth, SimplePost, FoundPost, TagCategory } from "./DataProvider";
import MT, { type PostInfo, TagCategory as MTCategory } from "../net/Minitokyo";

const TAG_CATEGORY: Partial<Record<MTCategory, TagCategory>> = {
    Mangaka: TagCategory.artist,
    Series: TagCategory.copyright,
    "Visual Novel": TagCategory.copyright,
    Game: TagCategory.copyright,
    OVA: TagCategory.copyright,
    Artbook: TagCategory.copyright,
    Character: TagCategory.character,
    Meta: TagCategory.meta,
}

const dataProvider: DataProvider<PostInfo, SimplePost> = {
    sourceName: "Minitokyo",
    authType: Auth.none,
    helpInfo: `Add at beginning "w:" ("wallpapers:"), "a:" ("arts:") or "s:" ("scans:") plus "u:" ("user:") to specify search results`,
    tagPrefixes: MT.tagPrefixes,
    async postCount (query: string) {
        const parsed = MT.parseQuery(query);
        if (parsed.category) {
            const res = await MT.getCounts(query);
            return res[parsed.category];
        }
        const res = await MT.getCounts(query);
        return res.wallpaper + res.art + res.scan;
    },
    async *findPosts (query: string): AsyncIterableIterator<FoundPost<PostInfo>> {
        const PAGE_SIZE = 24;
        const total = await this.postCount(query);
        const lastPage = Math.ceil(total / PAGE_SIZE);

        const parsed = MT.parseQuery(query);

        const realQuery = parsed.isUsername ? parsed.query : await MT.getCounts(parsed.query).then((tag) => tag.tagId!);

        let i = 0;
        if (parsed.category) {
            for (let page = 1; page <= lastPage; page += 1) {
                const posts = await MT.findPosts(realQuery, parsed.category, page);
                for (const post of posts) {
                    yield { post, progress: ++i / total };
                }
            };
            return;
        }

        for (const cat of ["wallpaper", "art", "scan"]) {
            const posts = this.findPosts(`${cat}:${query}`);
            let res = await posts.next();
            while (!res.done) {
                yield { post: res.value.post, progress: ++i / total };
                res = await posts.next();
            }
        }
    },
    getImage(post, size) {
        return size == "150" ? `http://static3.minitokyo.net/thumbs${post.md5}.jpg` // 180px
            : `http://static2.minitokyo.net/view${post.md5}.jpg` // 500px
    },
    getLink({ id }) {
        return `http://gallery.minitokyo.net/view/${id}`;
    },
    simplifyPost(post) {
        return {
            id: post.id ?? 1,
            md5: post.image ?? "",
            ext: "",
        };
    },
    async autocompleteTag(query) {
        const tags = await MT.autocompleteTag(query);
        return tags.map((tag) => {
            let name = tag.tag.toLowerCase();
            let matched = name;
            if (!matched.includes(query)) {
                matched = name.split(" ", 2).reverse().join(" ");
                if (!matched.includes(query)) matched = "?";
            }

            const categories = tag.categories.map((c) => TAG_CATEGORY[c] ?? TagCategory.general);

            return {
                category: Math.min(TagCategory.general, ...categories),
                matchedName: matched,
                mainName: name,
            };
        });
    }
}

export default dataProvider;

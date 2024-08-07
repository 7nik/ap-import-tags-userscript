/* eslint-disable no-await-in-loop */
import MT, { type PostInfo, type TagCategory as MTCategory } from "../net/Minitokyo";
import {
    type DataProvider, Auth, type SimplePost, type FoundPost, TagCategory,
} from "./DataProvider";

const TAG_CATEGORY: Partial<Record<MTCategory, TagCategory>> = {
    Mangaka: TagCategory.artist,
    Series: TagCategory.copyright,
    "Visual Novel": TagCategory.copyright,
    Game: TagCategory.copyright,
    OVA: TagCategory.copyright,
    Artbook: TagCategory.copyright,
    Character: TagCategory.character,
    Meta: TagCategory.meta,
};

const dataProvider: DataProvider<PostInfo, SimplePost> = {
    sourceName: "Minitokyo",
    authType: Auth.none,
    helpInfo: `Add at beginning "w:" ("wallpapers:"), "a:" ("arts:"), or "s:" ("scans:") \
        plus "u:" ("user:") to specify search results`,
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
    async* findPosts (query: string): AsyncIterableIterator<FoundPost<PostInfo>> {
        const PAGE_SIZE = 24;
        const total = await this.postCount(query);
        const lastPage = Math.ceil(total / PAGE_SIZE);

        const parsed = MT.parseQuery(query);

        const realQuery = parsed.isUsername
            ? parsed.query
            : await MT.getCounts(parsed.query).then((tag) => tag.tagId!);

        let found = 0;
        if (parsed.category) {
            for (let page = 1; page <= lastPage; page += 1) {
                const posts = await MT.findPosts(realQuery, parsed.category, page);
                for (const post of posts) {
                    found += 1;
                    yield { post, progress: found / total };
                }
            }
            return;
        }

        for (const cat of ["wallpaper", "art", "scan"]) {
            const posts = this.findPosts(`${cat}:${query}`);
            let res = await posts.next();
            while (!res.done) {
                found += 1;
                yield { post: res.value.post, progress: found / total };
                res = await posts.next();
            }
        }
    },
    getImage ({ id }, size) {
        const dir0 = size === "150" ? "thumbs" : "view"; // 180px or 500px
        const dir1 = (id % 50).toString().padStart(2, "0");
        const dir2 = ((id - +dir1) % 2500 / 50).toString().padStart(2, "0");
        return `http://static2.minitokyo.net/${dir0}/${dir1}/${dir2}/${id}.jpg`;
    },
    getLink ({ id }) {
        return `http://gallery.minitokyo.net/view/${id}`;
    },
    simplifyPost (post) {
        return {
            id: post.id ?? 1,
            md5: "",
            ext: "",
        };
    },
    async autocompleteTag (query) {
        const tags = await MT.autocompleteTag(query);
        return tags.map((tag) => {
            const name = tag.tag.toLowerCase();
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
    },
};

export default dataProvider;

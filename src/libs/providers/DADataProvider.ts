/* eslint-disable no-await-in-loop */
import DA, { type PostInfo } from "../net/DeviantArt";
import { type DataProvider, Auth, type FoundPost } from "./DataProvider";

const dataProvider: DataProvider<PostInfo, PostInfo> = {
    sourceName: "DeviantArt",
    authType: Auth.none,
    helpInfo: `Search by username only`,
    tagPrefixes: [],
    postCount(query: string) {
        return DA.getCounts(query);
    },
    async *findPosts(query: string): AsyncIterableIterator<FoundPost<PostInfo>> {
        const total = await this.postCount(query);

        let found = 0;
        let page: number | null = 0;
        while (page != null) {
            const data = await DA.findPosts(query, page);
            page = data.nextPage;
            for (const post of data.posts) {
                found += 1;
                yield { post, progress: found / total };
            }
        }
    },
    getImage({ sizes }, size) {
        const type = {
            150: "150", // 150px
            300: "400T", // 400px height
            500: "preview", // 700+px by smallest
            800: "preview", // 700+px by smallest
            orig: "fullview",
        }[size];

        const sub = sizes.types.find((t) => t.t === type)!.c;
        const token = sizes.token ? `?token=${sizes.token[0]}` : "";

        return [sizes.baseUri, sub, token].join("");
    },
    getLink({ id }) {
        return `https://deviantart.com/view/${id}`;
    },
    simplifyPost(post) {
        return post;
    },
    async autocompleteTag() {
        // no autocomplete
        return [];
    },
};

export default dataProvider;

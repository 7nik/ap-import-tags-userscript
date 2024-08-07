import type { SavedResult } from "./importer.svelte";
import AP from "./net/AnimePictures";
import APPostProvider from "./providers/APDataProvider";
import storage from "./storage.svelte";

export default function search (query:string) {
    const result: SavedResult = {
        providerName: "AnimePictures",
        query,
        date: Date.now(),
        results: [],
    };
    const state = $state({
        progress: 0,
    });
    let page = 0;
    let resp;
    (async () => {
        const tags = query.split("&&");
        const searchTags = tags.filter((t) => !t.startsWith("-")).join("&&");
        const excludeTags = tags.filter((t) => t.startsWith("-")).map((t) => t.slice(1)).join("||");
        do {
            // eslint-disable-next-line no-await-in-loop
            resp = await AP.searchPosts(page, { searchTags, excludeTags });
            result.results.push(...resp.posts.map((p) => ({
                source: null,
                result: APPostProvider.simplifyPost(p),
                sim: 0,
            })));
            page += 1;
            state.progress = 100 * page / resp.totalPages;
        } while (query && page < resp.totalPages);
        state.progress = 100;
        storage.search = result;
    })();
    return state;
}

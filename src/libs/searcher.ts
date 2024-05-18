import { writable, Writable } from "svelte/store";
import APPostProvider from "./providers/APDataProvider";
import type { SavedResult } from "./importer";
import LocalValue from "./localStorage";
import AP from "./net/AnimePictures";

export default function search (query:string): Writable<number> {
    const result: SavedResult = {
        providerName: "AnimePictures",
        query,
        date: Date.now(),
        results: [],
    };
    const progress = writable(0);
    let page = 0;
    let resp;
    (async () => {
        const tags = query.split("&&");
        const searchTags = tags.filter((t) => !t.startsWith("-")).join("&&");
        const excludeTags = tags.filter((t) => t.startsWith("-")).map(t => t.slice(1)).join("||");
        do {
            resp = await AP.searchPosts(page, { searchTags, excludeTags });
            result.results.push(...resp.posts.map(p => ({
                source:null,
                result: APPostProvider.simplifyPost(p),
                sim:0,
            })));
            page += 1;
            progress.set(100 * page / resp.totalPages);
        } while (query && page < resp.totalPages);
        progress.set(100);
        new LocalValue("search", result).set(result);
    })();
    return progress;
}

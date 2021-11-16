import { writable, Writable } from "svelte/store";
import type { SavedResult } from "./importer";
import LocalValue from "./localStorage";
import AP from "./net/AnimePictures"; 

export default function search (query:string): Writable<number> {
    const result: SavedResult = {
        query,
        date: Date.now(),
        results: [],
    };
    const progress = writable(0);
    let page = 0;
    let resp;
    (async () => {
        do {
            resp = await AP.searchPosts(page, { searchTags: query });
            result.results.push(...resp.posts.map(p => ({ ...p, dbLink:"", dbLarge:"", dbPreview:"", sim:0 })));
            page += 1;
            progress.set(100 * page / resp.totalPages);
        } while (query && page < resp.totalPages);
        progress.set(100);
        new LocalValue("search", result).set(result);
    })();
    return progress;
}

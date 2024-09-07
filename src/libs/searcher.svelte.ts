import type { SavedResult } from "./matcher.svelte";
import type { DataProvider } from "./providers";
import storage from "./storage.svelte";

export default function search(provider: DataProvider<any, any>, query: string) {
    const state = $state({
        progress: 0,
        link: "",
    });

    (async () => {
        const result: SavedResult = {
            providerName: provider.sourceName,
            query,
            date: Date.now(),
            results: [],
        };

        const iterator = provider.findPosts(query);
        let match = await iterator.next();
        while (!match.done) {
            result.results.push({
                source: null,
                result: provider.simplifyPost(match.value.post),
                sim: 0,
            });
            state.progress = match.value.progress;
            // eslint-disable-next-line no-await-in-loop
            match = await iterator.next();
        }

        storage[`res_${result.date}`] = result;
        state.link = `/res/${result.date}/0`;
    })();

    return state;
}

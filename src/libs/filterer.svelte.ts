import type { SavedResult, SavedResultMeta } from "./matcher.svelte";
import APDataProvider from "./providers/APDataProvider";
import savedResults from "./savedResults.svelte";

export default function filterer(base: SavedResultMeta, query: string) {
    const state = $state({
        result: null as SavedResult | null,
        progress: 0,
        link: "",
    });

    (async () => {
        const result: SavedResult = {
            providerName: APDataProvider.sourceName,
            query: `${base.query} +F: ${query}`,
            date: Date.now(),
            results: [],
        };
        state.link = `/res/${result.date}/0`;

        const ids = new Set();
        const iterator = APDataProvider.findPosts(query);
        let match = await iterator.next();
        while (!match.done) {
            ids.add(match.value.post.id);
            state.progress = Math.min(0.999, match.value.progress);
            // eslint-disable-next-line no-await-in-loop
            match = await iterator.next();
        }

        const resultToFilter = await savedResults.get(base.date);
        result.results = resultToFilter!.results.filter((res) => ids.has(res.result.id));
        await savedResults.add(result);
        state.progress = 1;
    })();

    return state;
}

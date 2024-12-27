<script lang="ts">
    import type { SavedResult } from "../libs/matcher.svelte";
    import { Filter, Trash2 } from "lucide-svelte";
    import APDataProvider from "../libs/providers/APDataProvider";
    import searcher from "../libs/searcher.svelte";
    import localStorage from "../libs/storage.svelte";
    import Block from "../parts/Block.svelte";
    import TagsField from "../parts/TagsField.svelte";

    const searches = $derived(
        localStorage
            .keys()
            .sort()
            .reverse()
            .filter((name) => name.startsWith("res_"))
            .map((name) => localStorage.get(name as any) as SavedResult),
    );

    let resultToFilter: SavedResult | null = $state(null);
    let filterQuery = $state("");
    let filter: ReturnType<typeof searcher> | null = $state(null);

    function deleteResult(search: SavedResult) {
        localStorage.delete(`res_${search.date}`);
    }

    function filterResult() {
        if (!resultToFilter) return;

        filter = searcher(APDataProvider, filterQuery);
    }
    $effect(() => {
        if (filter?.result) {
            if (!resultToFilter) {
                filter = null;
                return;
            }
            const ids = new Set(filter.result!.results.map((res) => res.result.id));
            const newResult: SavedResult = {
                providerName: resultToFilter.providerName,
                query: `${resultToFilter.query} +F: ${filterQuery}`,
                date: Date.now(),
                results: resultToFilter.results.filter((res) => ids.has(res.result.id)),
            };
            localStorage[`res_${newResult.date}`] = newResult;
            resultToFilter = null;
            deleteResult(filter.result);
            filter = null;
        }
    });
</script>

<Block title="Previous results">
    {#each searches as search}
        <div>
            <a href="#/res/{search.date}/0">{search.providerName}: {search.query}</a>
            <Trash2
                size="18"
                cursor="pointer"
                onclick={() => deleteResult(search)}
            />
            <Filter
                size="18"
                cursor="pointer"
                onclick={() => {
                    filterQuery = "";
                    resultToFilter = search;
                }}
            />
            <br />
            {search.results.length}
            {search.results[0]?.source ? "matched" : "found"}
            pictures on
            {new Date(search.date).toLocaleString()},
        </div>
    {:else}
        No saved imports!
    {/each}
</Block>

{#if resultToFilter}
    <section>
        <Block title="Filter the result">
            <form
                onsubmit={(ev) => {
                    ev.preventDefault();
                    filterResult();
                }}
            >
                The filter query
                <TagsField bind:value={filterQuery} />
                <button>Filter</button>
                <button
                    type="button"
                    onclick={() => {
                        resultToFilter = null;
                    }}>Cancel</button
                >
                {#if filter}
                    <progress value={filter.progress}></progress>
                {/if}
            </form>
        </Block>
    </section>
{/if}

<style>
    div {
        border-bottom: 1px solid #8888;
        padding: 10px 0;
    }
    div:first-child {
        padding-top: 0;
    }
    div:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    section {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        background: #000c;
        z-index: 15;
    }
    section > :global(div) {
        margin: auto;
    }
    progress {
        margin-top: 10px;
        width: 100%;
    }
</style>

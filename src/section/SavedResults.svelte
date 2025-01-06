<script lang="ts">
    import type { SavedResultMeta } from "../libs/matcher.svelte";
    import { Filter, Trash2 } from "lucide-svelte";
    import filterer from "../libs/filterer.svelte";
    import savedResults from "../libs/savedResults.svelte";
    import searcher from "../libs/searcher.svelte";
    import Block from "../parts/Block.svelte";
    import TagsField from "../parts/TagsField.svelte";

    let resultToFilter: SavedResultMeta | null = $state(null);
    let filterQuery = $state("");
    let filter: ReturnType<typeof searcher> | null = $state(null);

    function filterResult() {
        if (resultToFilter) {
            filter = filterer(resultToFilter, filterQuery);
        }
    }
    $effect(() => {
        if (filter?.progress === 1) {
            resultToFilter = null;
            filter = null;
        }
    });
</script>

<Block title="Previous results">
    {#each savedResults.list() as search}
        <div>
            <a href="#/res/{search.date}/0">{search.providerName}: {search.query}</a>
            <Trash2
                size="18"
                cursor="pointer"
                onclick={() => savedResults.delete(search)}
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
            {search.size}
            {search.type === "matching" ? "matched" : "found"}
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

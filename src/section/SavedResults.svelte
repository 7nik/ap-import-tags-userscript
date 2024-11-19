<script lang="ts">
    import type { SavedResult } from "../libs/matcher.svelte";
    import { Trash2 } from "lucide-svelte";
    import localStorage from "../libs/storage.svelte";
    import Block from "../parts/Block.svelte";

    let searches = localStorage
        .keys()
        .sort()
        .reverse()
        .filter((name) => name.startsWith("res_"))
        .map((name) => localStorage.get(name as any) as SavedResult);

    function deleteResult(search: SavedResult) {
        searches = searches.filter((s) => s !== search);
        localStorage.delete(`res_${search.date}`);
    }
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
</style>

<script lang="ts">
    import type { SavedResult } from "../libs/matcher.svelte";
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
            <!-- eslint-disable-next-line max-len -->
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <span
                class="icon_delete"
                onclick={() => deleteResult(search)}
            ></span>
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
    .icon_delete {
        display: inline-block;
        width: 18px;
        height: 18px;
        background-image: url(/assets/styles/icons/delete.svg);
        background-size: contain;
        cursor: pointer;
        margin-bottom: -2px;
    }
</style>

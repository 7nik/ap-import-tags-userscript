<script lang="ts">
    import type { SavedResult } from "../libs/importer.svelte";
    import { push } from "svelte-spa-router";
    import dataProviders from "../libs/providers";
    import localStorage from "../libs/storage.svelte";
    import Block from "../parts/Block.svelte";
    import TagsField from "../parts/TagsField.svelte";

    let dataProvider = dataProviders.Danbooru;

    let searches = localStorage
        .keys()
        .sort()
        .reverse()
        .filter((name) => name.startsWith("res_"))
        .map((name) => localStorage.get(name as any) as SavedResult);
    let form: HTMLFormElement;
    let query = "";

    function startImport(ev: Event) {
        if (!form.checkValidity()) return;
        ev.preventDefault();
        push(`/import/${dataProvider.sourceName}/${encodeURIComponent(query)}`);
    }

    function deleteResult(search: SavedResult) {
        searches = searches.filter((s) => s !== search);
        localStorage.delete(`res_${search.date}`);
    }
</script>

<Block title="New import">
    <form bind:this={form}>
        <span>Search on:</span>
        <select bind:value={dataProvider}>
            {#each Object.entries(dataProviders) as [name, dp]}
                <option value={dp}>{name}</option>
            {/each}
        </select>
        <span>Search query:</span>
        <span class="field">
            <TagsField
                autoAppend={true}
                placeholder="Query to search on {dataProvider.sourceName}"
                {dataProvider}
                bind:value={query}
            />
            <span
                title={dataProvider.helpInfo}
                class="question_icon"
            ></span>
        </span>
        <span>Danbooru key:</span>
        <input
            type="text"
            placeholder="Danbooru login, space, API key (desired)"
            bind:value={localStorage.dbkey}
            pattern={`.+ \\w{24}`}
        />
        <span>SauceNAO key:</span>
        <input
            type="text"
            placeholder="SauceNAO API key (optional)"
            bind:value={localStorage.snapikey}
            pattern={`[0-9a-f]{40}`}
        />
        <input
            type="submit"
            value="Start importing"
            onclick={startImport}
            onsubmit={startImport}
        />
    </form>
</Block>

<Block title="Previous imports">
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
            {search.results.length} found pictures {new Date(search.date).toLocaleString()},
        </div>
    {:else}
        No saved imports!
    {/each}
</Block>

<style>
    form {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 5px;
    }
    input[type="submit"] {
        grid-column: 1/3;
        margin: 10px auto;
    }
    .field {
        display: grid;
        grid-template-columns: auto min-content;
    }
    .question_icon {
        background-image: url(/assets/styles/icons/help.svg);
        background-size: contain;
        width: 16px;
        height: 16px;
        float: right;
        margin: 3px 0 0 10px;
    }
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

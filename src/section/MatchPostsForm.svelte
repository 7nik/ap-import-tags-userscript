<script lang="ts">
    import { push } from "svelte-spa-router";
    import dataProviders from "../libs/providers";
    import localStorage from "../libs/storage.svelte";
    import Block from "../parts/Block.svelte";
    import TagsField from "../parts/TagsField.svelte";

    let dataProvider = $state(dataProviders.Danbooru);
    let query = $state("");

    function startMatching(ev: Event) {
        if (!(ev.currentTarget as HTMLElement)?.closest("form")?.checkValidity()) return;
        ev.preventDefault();
        push(`/match/${dataProvider.sourceName}/${encodeURIComponent(query)}`);
    }
</script>

<Block title="Match posts">
    <form onsubmit={startMatching}>
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
            onclick={startMatching}
        />
    </form>
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
</style>

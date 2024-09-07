<script lang="ts">
    import { push } from "svelte-spa-router";
    import dataProviders from "../libs/providers";
    import searcher from "../libs/searcher.svelte";
    import Block from "../parts/Block.svelte";
    import TagsField from "../parts/TagsField.svelte";

    let dataProvider = $state(dataProviders.AnimePictures);
    let query = $state("");
    let search: ReturnType<typeof searcher> | null = $state(null);

    function startViewing(ev: Event) {
        if (!(ev.currentTarget as HTMLElement)?.closest("form")?.checkValidity()) return;
        ev.preventDefault();
        search = searcher(dataProvider, query);
    }

    $effect(() => {
        if (search?.progress === 1) {
            push(search.link);
            search = null;
        }
    });
</script>

<Block title="View posts">
    <form onsubmit={startViewing}>
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
        <input
            type="submit"
            value="Start viewing"
            onclick={startViewing}
        />
    </form>
</Block>

{#if search}
    <section>
        <Block title="Searching">
            Gathering the pictures of {query} on {dataProvider.sourceName} <br />
            <progress value={search.progress}></progress>
        </Block>
    </section>
{/if}

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
        width: 100%;
    }
</style>

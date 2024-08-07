<script lang="ts">
    import { onDestroy } from "svelte";
    import Router, { push } from "svelte-spa-router";
    import AP from "./libs/net/AnimePictures";
    import searcher from "./libs/searcher.svelte";
    import storage from "./libs/storage.svelte";
    import HomePage from "./pages/HomePage.svelte";
    import ImportPage from "./pages/ImportPage.svelte";
    import ViewResultsPage from "./pages/ViewResultsPage.svelte";
    import Block from "./parts/Block.svelte";

    AP.userData().then((res) => {
        if (storage.pageSize !== res.user.jvwall_ipp) {
            storage.pageSize = res.user.jvwall_ipp;
        }
        if (storage.isModerator !== res.user.groups.includes("moderator")) {
            storage.isModerator = res.user.groups.includes("moderator");
        }
    });

    let searching: { progress:number } | null = $state(null);
    const form = document.querySelector("#sidebar form");
    const input = form?.querySelector("[type=search]") as HTMLInputElement;
    const button = form?.querySelector("[type=submit]") as HTMLInputElement;
    input?.addEventListener("keydown", doSearch, true);
    button?.addEventListener("click", doSearch, true);

    function doSearch (ev: Event) {
        if (ev instanceof KeyboardEvent && ev.key !== "Enter") return;
        ev.preventDefault();
        ev.stopPropagation();
        searching = searcher(input.value);
    }

    $effect(() => {
        if (searching?.progress === 100) {
            searching = null;
            push("/res/search/0");
        }
    });

    onDestroy(() => {
        input?.removeEventListener("keydown", doSearch);
        button?.removeEventListener("click", doSearch);
    });

    const routes = {
        "/home": HomePage,
        "/import/:provider/:query": ImportPage,
        "/res/:name/:page": ViewResultsPage,
        "*": HomePage,
    };
</script>

<Router {routes} />

{#if searching}
    <div>
        <Block title="Searching">
            Gathering the pictures of {input.value} <br>
            <progress max="100" value={searching.progress}></progress>
        </Block>
    </div>
{/if}

<style>
    div {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        background: #000C;
        z-index: 15;
    }
    div > :global(div) {
        margin: auto;
    }
    progress {
        width: 100%;
    }
</style>

<script lang="ts">
    import type { SavedResult } from "../libs/matcher.svelte";
    import { GM } from "$";
    import { mount, onDestroy, unmount } from "svelte";
    import dataProviders from "../libs/providers";
    import storage from "../libs/storage.svelte";
    import APPost from "../parts/APPost.svelte";
    import BasePost from "../parts/BasePost.svelte";
    import MultiAction from "../parts/MultiAction.svelte";
    import PageNavigator from "../parts/PageNavigator.svelte";
    import SimilarityPost from "../parts/SimilarityPost.svelte";

    const { params }: { params: { name: string; page: number } } = $props();

    const search: SavedResult = storage[`res_${params.name}`] ?? ({ results: [] } as any);
    const dataProvider = dataProviders[search.providerName];
    const baseUrl = `#/res/${params.name}/`;

    const currPage = $derived(+params.page);
    const pageSize = $derived(storage.pageSize ?? 20);
    const pageCount = $derived(Math.ceil(search.results.length / pageSize));
    const posts = $derived(search.results.slice(currPage * pageSize, (currPage + 1) * pageSize));

    const hasSource = search.results.every((r) => r.source);

    const multiAction = mount(MultiAction, {
        target: document.getElementById("sidebar") ?? document.body,
        anchor: document.querySelector("#sidebar>.quick_search") ?? undefined,
    });
    onDestroy(() => {
        unmount(multiAction);
    });
    GM.addStyle(`
        .sidebar_block + .quick_search {
            display: none;
        }
    `);

    function reply(ev: MessageEvent) {
        if (ev.data.cmd !== "get_posts_data") return;
        (ev.source as Window)?.postMessage(
            {
                cmd: "posts_data",
                postsData: {
                    query: null,
                    page: 0,
                    lastPage: 0,
                    postIds: posts.map((post) => post.result.id),
                    lastPost: posts.length - 1,
                },
            },
            window.location.origin,
        );
    }
</script>

<svelte:window onmessage={reply} />
<header>
    {search.providerName}: {search.query} <a href="#/home">&lt; Go back</a>
    <br />
    {#if search.results[0]?.sim}
        <label>
            <input
                type="checkbox"
                bind:checked={storage.showSource}
            />
            show the source image,
        </label>
    {/if}
    post size:
    <select bind:value={storage.postSize}>
        <option label="small">150</option>
        <option label="medium">300</option>
        <option label="big">500</option>
        <option label="large">800</option>
    </select>
    <div class="header">
        Search results: {search.results.length} pictures
    </div>
</header>
<PageNavigator
    {baseUrl}
    {currPage}
    {pageCount}
/>
<div
    class="posts"
    style:--post-size="{storage.postSize === "800" ? 720 : storage.postSize}px"
>
    {#each posts as post (post.result.id)}
        {#if hasSource && storage.showSource}
            <SimilarityPost
                {post}
                {multiAction}
                {dataProvider}
            />
        {:else if hasSource || search.providerName === "AnimePictures"}
            <APPost
                post={post.result}
                {multiAction}
            />
        {:else}
            <BasePost
                post={post.result}
                {dataProvider}
            />
        {/if}
    {/each}
</div>
<PageNavigator
    {baseUrl}
    {currPage}
    {pageCount}
    showFastNavigator
/>

<style>
    header {
        padding: 10px;
    }
    .header {
        margin-top: -4px;
    }
    .posts {
        text-align: center;
    }
</style>

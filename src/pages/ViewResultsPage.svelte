<script lang="ts">
    import SimilarityPost from "../parts/SimilarityPost.svelte";
    import Post from "../parts/Post.svelte";
    import PageNavigator from "../parts/PageNavigator.svelte";
    import Multiaction from "../parts/Multiaction.svelte";
    import LocalValue from "../libs/localStorage";
    import { onDestroy } from "svelte";
    import { get } from "svelte/store";
    import dataProviders from "../libs/dataProviders";
    import type { Result, SavedResult } from "../libs/importer";

    export let params = { name: "", page: 0 };

    const pageSize = new LocalValue("pageSize", 20);
    const search = get(new LocalValue(
        params.name === "search" ? "search" : `res_${params.name}`,
        {} as SavedResult,
    ));
    const dataProvider = dataProviders[search.providerName];
    const pageCount = Math.ceil(search.results?.length/$pageSize);
    const baseUrl = `#/res/${params.name}/`;
    let posts: Result[];
    let currPage: number;
    $: {
        currPage = +params.page;
        posts = search.results.slice(currPage*$pageSize, (currPage+1)*$pageSize);
    }

    let postSize = new LocalValue("postSize", "300" as "150"|"300"|"500");
    let showSource = new LocalValue("showSource", true);
    const canShowSource = search.results.every((r) => r.source);

    const multiaction = new Multiaction({
        target: document.getElementById("sidebar") ?? document.body,
        anchor: document.querySelector("#sidebar>.quick_search") ?? undefined,
    });
    onDestroy(() => {
        multiaction.$destroy();
    });

    function reply(ev: MessageEvent) {
        if (ev.data.cmd !== "get_posts_data") return;
        (ev.source as WindowProxy)?.postMessage({
            cmd: "posts_data",
            postsData: {
                query: null,
                page: 0,
                lastPage: 0,
                postIds: posts.map(post => post.result.id),
                lastPost: posts.length-1,
            },
        }, location.origin);
    }
</script>

<svelte:window on:message={reply} />
<header>
    {search.providerName}: {search.query} <a href="#/home">&lt; Go back</a>
    <br>
    {#if search.results[0]?.sim}
        <label>
            <input type="checkbox" bind:checked={$showSource}>
            show the source image,
        </label>
    {/if}
    post size: <select bind:value={$postSize}>
        <option label="small">150</option>
        <option label="medium">300</option>
        <option label="big">500</option>
    </select>
    <div class="header">
        Search results: {search.results.length} pictures
    </div>
</header>
<PageNavigator {baseUrl} {currPage} {pageCount} />
<div class="posts" style:--post-size="{$postSize}px">
    {#each posts as post (post.result.id)}
        {#if $showSource && canShowSource}
            <SimilarityPost {post} postSize={$postSize} {multiaction} {dataProvider} />
        {:else}
            <Post post={post.result} postSize={$postSize} {multiaction} />
        {/if}
    {/each}
</div>
<PageNavigator {baseUrl} {currPage} {pageCount} />

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

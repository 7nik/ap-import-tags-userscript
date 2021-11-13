<script lang="ts">
    import SimilarityPost from "../parts/SimilarityPost.svelte";
    import Post from "../parts/Post.svelte";
    import PageNavigator from "../parts/PageNavigator.svelte";
    import Multiaction from "../parts/Multiaction.svelte";
    import LocalValue from "../libs/localStorage";
    import { onDestroy } from "svelte";
    import type { Result, SavedResult } from "../libs/importer";

    export let params = { name: "", page: 0 };

    const pageSize = new LocalValue("pageSize", 20);
    const result = new LocalValue(`res_${params.name}`, {} as SavedResult);
    const pageCount = Math.ceil($result.results.length/$pageSize);
    const baseUrl = `#/res/${$result.date}/`;
    let posts: Result[];
    let currPage: number;
    $: {
        currPage = +params.page;
        posts = $result.results.slice(currPage*$pageSize, (currPage+1)*$pageSize);
    }

    let postSize = new LocalValue("postSize", "300");
    let showSource = new LocalValue("showSource", true);
    $: PostBlock = showSource ? SimilarityPost : Post;
    
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
                postIds: posts.map(post => post.id),
                lastPost: posts.length-1,
            },
        }, location.origin);
    }
</script>

<svelte:window on:message={reply} />
<a href="#/home">&lt; Go back</a>
<br>
<label>
    <input type="checkbox" bind:checked={showSource}>
    show the source image,
</label>
post size: <select bind:value={postSize}>
    <option label="small">150</option>
    <option label="medium">300</option>
    <option label="big">500</option>
</select>
<div id="posts">
    <div class="header">
        Search results: {$result.results.length} pictures
    </div>
    <PageNavigator {baseUrl} {currPage} {pageCount} />
    <div style="--post-size: {postSize}px">
        {#each posts as post (post.id)}
            <svelte:component this={PostBlock} {post} {postSize} {multiaction} />
        {/each}
    </div>
    <PageNavigator {baseUrl} {currPage} {pageCount} />
</div>

<style>
    #posts {
        margin-top: -4px;
    }
</style>

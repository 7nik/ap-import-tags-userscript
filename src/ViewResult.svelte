<script lang="ts">
import type { Result, SavedResult } from "./importer";
import SimilarityPost from "./SimilarityPost.svelte";
import PageNavigator from "./PageNavigator.svelte";
import Multiaction from "./Multiaction.svelte";
import LocalValue from "./localStorage";
import { onDestroy } from "svelte";

    export let params = { name: "", page: 0 };

    const result = new LocalValue(`res_${params.name}`, {} as SavedResult);
    const pageCount = Math.ceil($result.results.length/20);
    const baseUrl = `#/res/${$result.date}/`;
    let posts: Result[];
    let currPage: number;
    $: {
        currPage = +params.page;
        posts = $result.results.slice(currPage*20, (currPage+1)*20);
    }
    
    const multiaction = new Multiaction({
        target: document.getElementById("sidebar") ?? document.body,
        anchor: document.querySelector("#sidebar>.quick_search") ?? undefined,
    });
    onDestroy(() => {
        multiaction.$destroy();
    });
</script>

<a href="#/home">&lt; Back</a>
<div id="posts">
    <div class="center">
        <div class="header">
            Search results: {$result.results.length} pictures
        </div>
        <PageNavigator {baseUrl} {currPage} {pageCount} />
        <div class="cetner posts_block">
            {#each posts as post (post.id)}
                <SimilarityPost {post} {multiaction}/>
            {/each}
        </div>
        <PageNavigator {baseUrl} {currPage} {pageCount} />
    </div>
</div>

<style>
    #posts {
        margin-top: -4px;
    }
    .center {
        text-align: center;
    }
</style>

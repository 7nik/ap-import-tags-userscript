<script lang="ts">
import type { Result, SavedResult } from "./importer";
import PageNavigator from "./PageNavigator.svelte";
import { writable } from "svelte/store";
import LocalValue from "./localStorage";
import SimilarityPost from "./SimilarityPost.svelte";

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
                <SimilarityPost {post} />
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

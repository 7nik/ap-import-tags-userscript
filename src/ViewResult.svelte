<script lang="ts">
import type { SavedResult } from "./importer";
import LocalValue from "./localStorage";
import PageNavigator from "./PageNavigator.svelte";
import Post from "./Post.svelte";

    export let params = { name: "", page: 0 };

    const result = new LocalValue(`res_${params.name}`, {} as SavedResult);
    const posts = $result.results.slice(params.page*100, (+params.page+1)*100);
    const pageCount = Math.ceil($result.results.length/100);
</script>

<div id="posts">
    <div class="center">
        <div class="header">
            Search results: {$result.results.length} pictures
        </div>
        <PageNavigator baseUrl="#/res/{$result.date}/" currPage={params.page} {pageCount} />
        <div class="cetner posts_block">
            {#each posts as post}
                <Post {post} />
            {/each}
        </div>
        <PageNavigator baseUrl="#/res/{$result.date}/" currPage={params.page} {pageCount} />
    </div>
</div>

<style>
    #posts {
        margin-top: 15px;
    }
    .center {
        text-align: center;
    }
</style>

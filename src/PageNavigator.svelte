<script lang="ts">
    import type { Writable } from "svelte/store";

    export let pageCount: number;
    export let currPage: Writable<number>;
    export let baseUrl = "";
    const pages = Array(pageCount).fill(1).map((_, i) => i);

    function setPage(page: number) {
        currPage.set(page);
    }
</script>

<p class="numeric_pages">
    {#if $currPage != 0} 
        <a href="{baseUrl}0" on:click={()=>setPage(0)}>&lt;</a>
    {/if}
    {#each pages as page}
        {#if page == $currPage}
            <span class="active">{page}</span>
        {:else}
            <a href="{baseUrl}{page}" on:click={()=>setPage(page)}>{page}</a>
        {/if}
    {/each}
    {#if $currPage != pageCount-1} 
        <a href="{baseUrl}{pageCount-1}" on:click={()=>setPage(pageCount-1)}>&gt;</a>
    {/if}
</p>

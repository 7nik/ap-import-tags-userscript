<script lang="ts">
    import type { Writable } from "svelte/store";

    export let pageCount: number;
    export let currPage: number;
    export let baseUrl = "";
    let pages: (number|null)[];
    $: {
        pages = [];
        if (currPage <= 6) {
            pages.push(...Array(currPage+1).fill(1).map((_, i) => i));
        } else {
            pages.push(0, 1, 2, null, currPage-2, currPage-1, currPage);
        }
        if (currPage < pageCount-1) {
            if (pageCount - currPage > 7) { 
                pages.push(
                    currPage+1, currPage+2, 
                    null,
                    pageCount-3, pageCount-2, pageCount-1,
                );
            } else {
                pages.push(
                    ...Array(pageCount-currPage-1).fill(1)
                        .map((_,i) => currPage+i+1)
                );
            }
        }
    } 
</script>

<p class="numeric_pages">
    {#if currPage != 0} 
        <a href="{baseUrl}{currPage-1}">&lt;</a>
    {/if}
    {#each pages as page}
        {#if page == currPage}
            <span class="active">{page}</span>
        {:else if page !== null}
            <a href="{baseUrl}{page}">{page}</a>
        {:else}
            <span>...</span>
        {/if}
    {/each}
    {#if currPage != pageCount-1} 
        <a href="{baseUrl}{currPage+1}">&gt;</a>
    {/if}
</p>

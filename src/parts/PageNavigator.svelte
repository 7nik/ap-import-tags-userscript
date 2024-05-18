<script lang="ts">
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

<style>
    .numeric_pages {
        padding-top: .5rem;
        padding-bottom: .5rem;
        text-align: center;
    }
    .active {
        background: var(--numeric-pages-active-color);
        box-shadow: #000000bf 0 0 inset;
    }
    span, a {
        display: inline-block;
        text-decoration: none;
        height: 25px;
        line-height: 25px;
        padding-left: 5px;
        padding-right: 5px;
        margin-left: 2px;
        margin-right: 2px;
        box-shadow: var(--numeric-pages-box-shadow);
        color: var(--b-color);
        transition: all .5s ease-in-out;
    }
    a:hover {
        background: var(--numeric-pages-hover-color);
    }
</style>
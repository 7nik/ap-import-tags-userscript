<script lang="ts">
    const { pageCount, currPage, baseUrl = "" }: {
        pageCount:number, currPage:number, baseUrl?:string,
    } = $props();

    const pages = $derived.by(() => {
        // eslint-disable-next-line no-shadow
        const pages = [];
        for (let i = 0; i <= 2 && i < pageCount; i++) {
            pages.push(i);
        }
        if (currPage >= 6) pages.push(null); // "..." text
        for (let i = Math.max(3, currPage - 2); i <= currPage + 2 && i < pageCount; i++) {
            pages.push(i);
        }
        if (pageCount - currPage > 6) pages.push(null); // "..." text
        for (let i = Math.max(currPage + 3, pageCount - 3); i < pageCount; i++) {
            pages.push(i);
        }
        return pages;
    });
</script>

<p class="numeric_pages">
    {#if currPage !== 0}
        <a href="{baseUrl}{currPage - 1}">&lt;</a>
    {/if}
    {#each pages as page}
        {#if page === currPage}
            <span class="active">{page}</span>
        {:else if page !== null}
            <a href="{baseUrl}{page}">{page}</a>
        {:else}
            <span>...</span>
        {/if}
    {/each}
    {#if currPage !== pageCount - 1}
        <a href="{baseUrl}{currPage + 1}">&gt;</a>
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

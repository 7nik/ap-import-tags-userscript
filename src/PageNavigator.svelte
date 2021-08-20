<script lang="ts">
    export let pageCount: number;
    export let currPage: number;
    export let baseUrl = "";
    const pages = Array(pageCount).fill(1).map((_, i) => i);
</script>

<p class="numeric_pages">
    {#if currPage != 0} <a href="{baseUrl}0">&lt;</a>{/if}
    {#each pages as page}
        {#if page == currPage}
            <span class="active">{page}</span>
        {:else}
            <a href="{baseUrl}{page}">{page}</a>
        {/if}
    {/each}
    {#if currPage != pageCount-1} <a href="{baseUrl}{pageCount-1}">&gt;</a>{/if}
</p>

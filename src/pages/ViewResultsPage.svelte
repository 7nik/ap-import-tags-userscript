<script lang="ts">
    import type { SavedResult, SavedResultMeta } from "../libs/matcher.svelte";
    import dataProviders from "../libs/providers";
    import savedResults from "../libs/savedResults.svelte";
    import storage from "../libs/storage.svelte";
    import APPost from "../parts/APPost.svelte";
    import BasePost from "../parts/BasePost.svelte";
    import MultiAction from "../parts/MultiAction.svelte";
    import PageNavigator from "../parts/PageNavigator.svelte";
    import SimilarityPost from "../parts/SimilarityPost.svelte";

    const { params }: { params: { name: string; page: number } } = $props();

    const meta: SavedResultMeta = storage.results?.[params.name] ?? ({ results: [] } as any);
    const dataProvider = dataProviders[meta.providerName];
    const baseUrl = `#/res/${params.name}/`;

    const currPage = $derived(+params.page);
    const pageSize = $derived(storage.pageSize ?? 20);
    const pageCount = $derived(Math.ceil(meta.size / pageSize));
    const hasSource = meta.type === "matching";

    let search: SavedResult | null = $state(null);
    $effect(() => {
        savedResults.get(params.name).then((res) => {
            search = res!;
        });
    });
    const posts = $derived.by(
        () => search?.results.slice(currPage * pageSize, (currPage + 1) * pageSize) ?? [],
    );

    let multiAction: ReturnType<typeof MultiAction> | null = $state(null);

    function reply(ev: MessageEvent) {
        if (ev.data.cmd !== "get_posts_data") return;
        (ev.source as Window)?.postMessage(
            {
                cmd: "posts_data",
                postsData: {
                    query: null,
                    page: 0,
                    lastPage: 0,
                    postIds: posts.map((post) => post.result.id),
                    lastPost: posts.length - 1,
                },
            },
            window.location.origin,
        );
    }
</script>

<svelte:window onmessage={reply} />
<header>
    <section>
        {meta.providerName}: {meta.query} <a href="#/home">&lt; Go back</a>
        <br />
        {#if hasSource}
            <label>
                <input
                    type="checkbox"
                    bind:checked={storage.showSource}
                />
                show the source image,
            </label>
        {/if}
        post size:
        <select bind:value={storage.postSize}>
            <option label="small">150</option>
            <option label="medium">300</option>
            <option label="big">500</option>
            <option label="large">800</option>
        </select>
        <div>
            Search results: {meta.size} pictures
        </div>
    </section>
    <section>
        <PageNavigator
            {baseUrl}
            {currPage}
            {pageCount}
            showFastNavigator
        />
    </section>
    <section>
        <MultiAction bind:this={multiAction} />
    </section>
</header>
<div
    class="posts"
    style:--post-size="{storage.postSize === "800" ? 720 : storage.postSize}px"
>
    {#each posts as post (post.result.id)}
        {#if hasSource && storage.showSource}
            <SimilarityPost
                {post}
                {multiAction}
                {dataProvider}
            />
        {:else if hasSource || meta.providerName === "AnimePictures"}
            <APPost
                post={post.result}
                {multiAction}
            />
        {:else}
            <BasePost
                post={post.result}
                {dataProvider}
            />
        {/if}
    {/each}
</div>

<style>
    :global(.body-wrapper > .content.alt) {
        height: calc(100vh - 40px);
        display: flex;
        flex-direction: column;
    }
    header {
        padding: 10px;
        display: grid;
        grid-template-columns: 680px auto 680px;
        justify-content: space-between;
    }
    .posts {
        text-align: center;
        overflow: auto;
    }
</style>

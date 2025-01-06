<script lang="ts">
    import type MultiAction from "./MultiAction.svelte";
    import type { Result } from "../libs/matcher.svelte";
    import type { DataProvider } from "../libs/providers";
    import { POST_STATUS_TEXT } from "../libs/constant";
    import APPostProvider from "../libs/providers/APDataProvider";
    import storage from "../libs/storage.svelte";
    import {
        contrastColor,
        eroticColor,
        getCorsImage,
        isPostPublished,
        siteLang,
    } from "../libs/utils.svelte";

    const {
        post,
        multiAction,
        dataProvider,
    }: {
        post: Result;
        multiAction: ReturnType<typeof MultiAction>;
        dataProvider: DataProvider<any, any>;
    } = $props();
    const result = $derived(post.result);

    const getImage = dataProvider.sourceName === "Minitokyo" ? getCorsImage : <T,>(x: T): T => x;

    const size = $derived(storage.postSize ?? "300");
    const apImg = $derived(APPostProvider.getImage(result, size));
    const dbImg = $derived.by(getImage(() => dataProvider.getImage(post.source, size)));
    const lang = siteLang();

    let pending = $state(0);
    async function handleClick(ev: MouseEvent) {
        if (multiAction.isEnabled()) {
            ev.preventDefault();
            pending += 1;
            try {
                await multiAction.applyTo(post.result.id);
            } catch {
                // eslint-disable-next-line no-alert
                alert(`Failed to apply to post #${post.result.id}`);
            } finally {
                pending -= 1;
            }
        }
    }
</script>

<span
    class="post"
    class:pending
>
    <div
        class="img_block_text"
        style="
        background-image: linear-gradient(to right, transparent, rgb({result.color}), transparent);
        color: {contrastColor(result)};"
    >
        <a
            href="/pictures/view_posts/0?res_x={result.width}&res_y={result.height}&lang={lang}"
            title="Anime pictures {result.width}x{result.height}"
            target="_blank"
            style="background-color: {eroticColor(result)};"
        >
            {result.width}x{result.height}
        </a>
        <span title="Tags Num">({result.tags_count})</span>
        <span title="Similarity">{Math.round(+post.sim)}%</span>
        <br hidden={isPostPublished(result)} />
        {POST_STATUS_TEXT[result.status]}
    </div>
    <a
        class="db_link"
        href={post.source ? dataProvider.getLink(post.source) : ""}
        title="{dataProvider.sourceName} post"
        aria-label="{dataProvider.sourceName} post"
        target="_blank"
        onclick={handleClick}
    >
    </a>
    <a
        class="ap_link"
        href="/pictures/view_post/{result.id}?lang={lang}"
        title="Anime pictures post"
        aria-label="Anime pictures post"
        target="_blank"
        rel="opener"
        onclick={handleClick}
    >
    </a>
    <div class="db_img">
        <img
            src={dbImg}
            alt="{dataProvider.sourceName} thumb"
        />
    </div>
    <div class="ap_img">
        <img
            src={apImg}
            alt="Anime pictures thumb"
        />
    </div>
</span>

<style>
    span.post {
        display: inline-grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
        vertical-align: bottom;
        margin: 3px;
        width: var(--post-size);
        height: var(--post-size);
        transition: opacity 0.2s 0.2s;
    }
    img {
        max-width: 100%;
        max-height: 100%;
    }
    .post.pending {
        transition: none;
        opacity: 0.5;
    }
    .img_block_text {
        position: absolute;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 1;
        a {
            color: inherit;
        }
    }
    .db_img,
    .ap_img {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        clip-path: rect(0% 50% 100% 0%);
        transition: clip-path 1s;
        overflow: hidden;
        pointer-events: none;
    }
    .ap_img {
        clip-path: rect(0% 100% 100% 50%);
    }
    .db_link:hover ~ .db_img {
        clip-path: rect(0% 100% 100% 0%);
    }
    .db_link:hover ~ .ap_img {
        clip-path: rect(0% 100% 100% 100%);
        transition-duration: 1.05s;
    }
    .ap_link:hover ~ .ap_img {
        clip-path: rect(0% 100% 100% 0%);
    }
    .ap_link:hover ~ .db_img {
        clip-path: rect(0% 0% 100% 0%);
        transition-duration: 1.05s;
    }
</style>

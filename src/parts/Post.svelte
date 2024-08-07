<script lang="ts">
    import type MultiAction from "./MultiAction.svelte";
    import type { SimpleAPPost } from "../libs/providers/APDataProvider";
    import { POST_STATUS_TEXT } from "../libs/constant";
    import APPostProvider from "../libs/providers/APDataProvider";
    import storage from "../libs/storage.svelte";
    import {
        contrastColor, eroticColor, isPostPublished, siteLang,
    } from "../libs/utils.svelte";

    const { post, multiAction }: {
        post: SimpleAPPost,
        multiAction: Pick<MultiAction, "isEnabled"|"applyTo">,
    } = $props();

    const imgSrc = $derived(APPostProvider.getImage(post, storage.postSize ?? "300"));
    const lang = siteLang();

    let pending = $state(false);
    function handleClick (ev: MouseEvent) {
        if (pending) {
            ev.preventDefault();
            return;
        }
        if (multiAction.isEnabled()) {
            ev.preventDefault();
            pending = true;
            multiAction.applyTo(post.id).finally(() => { pending = false; });
        }
    }
</script>

<span class="post" class:pending>
    <a href="/pictures/view_post/{post.id}?lang={lang}"
        title="Anime pictures {post.width}x{post.height}"
        target="_blank"
        rel="opener"
        onclick={handleClick}
    >
        {#if imgSrc.endsWith(".mp4")}
            <video src={imgSrc} muted></video>
        {:else}
            <!-- svelte-ignore a11y_missing_attribute -->
            <img src="{imgSrc}">
        {/if}
    </a>
    <div class="img_block_text" style="
        opacity: 1;
        background-image: linear-gradient(to right, transparent, rgb({post.color}), transparent);
        color: {contrastColor(post)};"
    >
        <a href="/pictures/view_posts/0?res_x={post.width}&res_y={post.height}&lang={lang}"
            title="Anime pictures {post.width}x{post.height}"
            target="_blank"
            style="background-color: {eroticColor(post)};"
        >
            {post.width}x{post.height}
        </a>
        <span title="Tags Num">({post.tags_count})</span>
        <br hidden={isPostPublished(post)}>
        {POST_STATUS_TEXT[post.status]}
    </div>
</span>

<style>
    .post {
        display: inline-block;
        position: relative;
        vertical-align: bottom;
        margin: 3px;
        width: var(--post-size);
        height: var(--post-size);
        transition: opacity 0.2s 0.2s;
        text-align: center;
    }
    .img_block_text {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
    }
    .img_block_text a {
        color: inherit;
    }
    span > a {
        height: var(--post-size);
        display: block;
    }
    img, video {
        max-width: var(--post-size);
        max-height: var(--post-size);
    }
    .post.pending {
        transition: none;
        opacity: 0.5;
    }
</style>

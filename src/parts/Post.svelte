<script lang="ts">
    import type Multiaction from "./Multiaction.svelte";
    import type { SimpleAPPost } from "../libs/providers/APDataProvider";
    import APPostProvider from "../libs/providers/APDataProvider";

    export let post: SimpleAPPost;
    export let postSize: "150"|"300"|"500" = "300";
    export let multiaction: Multiaction;

    $: imgSrc = APPostProvider.getImage(post, postSize);
    // @ts-ignore
    const bgcolor = unsafeWindow.is_moderator
        ? ["none", "#F0F", "#F90", "#F00"][post.erotics]
        : "none";
    const textColor = post.color.reduce((s,a)=>s+a) > 128*3 ? "black" : "white";
    const status = { "-2": "PRE", 0: "NEW", 1: "", 2: "BAN" }[post.status];
    // @ts-ignore
    const lang = unsafeWindow.lang || "en";

    let pending = false;
    function handleClick (ev: MouseEvent) {
        if (pending) {
            ev.preventDefault();
            return;
        }
        if (multiaction?.enabled) {
            ev.preventDefault();
            pending = true;
            multiaction.apply(post.id).finally(() => pending = false);
        }
    }
</script>

<span class="post" class:pending>
    <a href="/pictures/view_post/{post.id}?lang={lang}"
        title="Anime pictures {post.width}x{post.height}"
        target="_blank"
        rel="opener"
        on:click={handleClick}
    >
        {#if imgSrc.endsWith(".mp4")}
            <video src={imgSrc} muted></video>
        {:else}
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src="{imgSrc}">
        {/if}
    </a>
    <div class="img_block_text" style="
        opacity: 1;
        background-image: linear-gradient(to right, transparent, rgb({post.color}), transparent);
        color: {textColor};"
    >
        <a href="/pictures/view_posts/0?res_x={post.width}&amp;res_y={post.height}&amp;{lang}"
            title="Anime pictures {post.width}x{post.height}"
            target="_blank"
            style="background-color: {bgcolor};"
        >
            {post.width}x{post.height}
        </a>
        <span title="Tags Num">({post.tags_count})</span>
        <br hidden={!status}>
        {status}
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

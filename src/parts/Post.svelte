<script lang="ts">
    import type Multiaction from "./Multiaction.svelte";
    import type { Result } from "../libs/importer";
    
    export let post: Result;
    export let postSize: string = "300";
    export let multiaction: Multiaction;

    $: imgSrc = postSize === "150"
        ? post.small_preview
        : postSize === "300"
            ? post.medium_preview
            : post.big_preview;
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
        <!-- svelte-ignore a11y-missing-attribute -->
        <img src="{imgSrc}">
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
        <br hidden={!!status}>
        {status}
    </div>
</span>

<style>
    span.post {
        display: inline-block;
        position: relative;
        vertical-align: bottom;
        margin: 3px;
        width: var(--post-size);
        height: var(--post-size);
    }
    span > a {
        height: var(--post-size);
        display: block;
    }
    img {
        max-width: var(--post-size);
        max-height: var(--post-size);
    }
    .post.pending {
        opacity: 0.5;
    }
</style>

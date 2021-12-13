<script lang="ts">
    import type Multiaction from "./Multiaction.svelte";
    import type { Result } from "../libs/importer";
    
    export let post: Result;
    export let postSize: "150"|"300"|"500" = "300";
    export let multiaction: Multiaction;

    $: apImg = postSize === "150"
        ? post.small_preview
        : postSize === "300"
            ? post.medium_preview
            : post.big_preview;
    $: dbImg = postSize === "150" || post.dbPreview.endsWith("/download-preview.png")
        ? post.dbPreview 
        : postSize === "300"
            ? post.dbPreview.replace("preview", "360x360")
            : post.dbPreview.replace("preview", "720x720").slice(0, -3).concat("webp");
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
    <div class="img_block_text" style="
        opacity: 1;
        background-image: linear-gradient(to right, transparent, rgb({post.color}), transparent);
        color: {textColor};"
    > 
        <a href="/pictures/view_posts/0?res_x={post.width}&amp;res_y={post.height}&amp;lang=en" 
            title="Anime pictures {post.width}x{post.height}"
            target="_blank"
            style="background-color: {bgcolor};"
        >
            {post.width}x{post.height}
        </a>
        <span title="Tags Num">({post.tags_count})</span>
        <span title="Similarity">{Math.round(+post.sim)}%</span>
        <br hidden={!!status}>
        {status}
    </div>
    <a class="db_link" 
        href={post.dbLink} 
        title="Danbooru post" 
        target="_blank"
        on:click={handleClick}
    > </a>
    <a class="ap_link" 
        href="/pictures/view_post/{post.id}?lang={lang || "en"}" 
        title="Anime pictures post" 
        target="_blank"
        rel="opener"
        on:click={handleClick}
    > </a>
    <div class="db_img">
        <div class="container" >
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src="{dbImg}">
        </div>
    </div>
    <div class="ap_img">
        <div class="container">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src="{apImg}">
        </div>
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
    img {
        max-width: var(--post-size);
        max-height: var(--post-size);
    }
    .post.pending {
        opacity: 0.5;
    }
    .db_link, .ap_link {
        display: block;
        position: absolute;
        width: 50%;
        height: 100%;
    }
    .ap_link, .ap_img {
        right: 0;
    }
    .db_img, .ap_img {
        position: absolute;
        top: 0;
        height: 100%;
        width: 50%;
        transition: width 1s;
        overflow: hidden;
        pointer-events: none;
    }
    .container {
        position: absolute;
        width: var(--post-size);
    }
    .ap_img .container {
        right: 0;
    }
    .db_link:hover ~ .db_img {
        width: 100%;
    }
    .db_link:hover ~ .ap_img {
        width: 0;
        transition-duration: 1.05s;
    }
    .ap_link:hover ~ .ap_img {
        width: 100%;
    }
    .ap_link:hover ~ .db_img {
        width: 0;
        transition-duration: 1.05s;
    }
</style>

<script lang="ts">
    import type Multiaction from "./Multiaction.svelte";
    import type { Result } from "../libs/importer";
    
    export let post: Result;
    export let size: "small"|"medium"|"big" = "medium";
    export let multiaction: Multiaction;

    const imgLink = post.preview
        .replace(/_[scb]p\./, {
            small: "_sp.",
            medium: "_cp.",
            big: "_bp.",
        }[size])
        .replace(/(jpe?g|png|gif)$/, $1 => $1 === "gif" ? $1+".webp" : $1+".avif");
    const postClass = {
        small: "img_block2",
        medium: "img_block_big",
        big: "img_block2 huge",
    }[size];    
    const imgClass = {
        small: "img_sp",
        medium: "img_cp",
        big: "img_bp",
    }[size];
    let dbImg = post.dbImg;
    if (size === "small") {
        const [md5] = dbImg.match(/(\w{32})/) ?? [];
        const f1 = md5.slice(0, 2);
        const f2 = md5.slice(2, 4);
        dbImg = `https://cdn.donmai.us/preview/${f1}/${f2}/${md5}.jpg`;
    }
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

<span class="post {postClass}" class:pending on:click={handleClick}>
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
        <span title="Tags Num">({post.tagsCount})</span>
        <span title="Similarity">{Math.round(+post.sim)}%</span>
        <br hidden={!!status}>
        {status}
    </div>
    <a class="db_link" 
        href={post.dbLink} 
        title="Danbooru post" 
        target="_blank"
    > </a>
    <a class="ap_link" 
        href="/pictures/view_post/{post.id}?lang={lang || "en"}" 
        title="Anime pictures post" 
        target="_blank"
        rel="opener"
    > </a>
    <div class="db_img">
        <div class="container" >
            <!-- svelte-ignore a11y-missing-attribute -->
            <img class="{imgClass}" src="{dbImg}" />
        </div>
    </div>
    <div class="ap_img">
        <div class="container">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img class="{imgClass}" src="{imgLink}" />
        </div>
    </div>
</span>

<style>
    .img_block2.huge {
        width: 500px;
        height: 500px;
        max-height: 500px;
    }
    .img_bp {
        padding: 0;
        margin: 0;
        max-width: 500px;
        max-height: 500px;
    }
    span.post {
        position: relative;
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
    .ap_img .container {
        position: absolute;
        right: 0;
    }
    .img_block2 .container {
        display: inline-block;
        width: 150px;
    }
    .img_block_big .container {
        display: inline-block;
        width: 300px;
    }
    .img_block2.huge .container {
        display: inline-block;
        width: 500px;
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

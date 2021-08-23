<script lang="ts">
    import type { Result } from "./importer.js";
    export let post: Result;
    export let size: "small"|"medium"|"big" = "medium";

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
    const bgcolor = window.is_moderator
        ? ["none", "#F0F", "#F90", "#F00"][post.erotics]
        : "none";
    const textColor = post.color.reduce((s,a)=>s+a) > 128*3 ? "black" : "white";
    const status = { "-2": "PRE", 0: "NEW", 1: "", 2: "BAN" }[post.status]
</script>

<span class="post {postClass}">
    <div class="img_block_text" style="
        opacity: 1;
        background-image: linear-gradient(to right, rgba({post.color},0), rgba({post.color},1), rgba({post.color},0));
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
        {Math.round(+post.sim)}%
        <br hidden={!!status}>
        {status}
    </div>
    <div class="db_link">
        <a href={post.dbLink} title="Danbooru post" target="_blank">
            <img class="db_img {imgClass}"
                src="{dbImg}"
                alt="Danbooru preview"
            >
        </a>
    </div>
    <div class="ap_link">
        <a  href="/pictures/view_post/{post.id}?lang=en" 
            title="Anime picture {post.width}x{post.height}" 
            target="_blank"
        >
            <img class="ap_img {imgClass}" 
                src="{imgLink}" 
                alt="Anime picture #{post.id}"
            >
        </a>

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
    .db_link, .ap_link {
        position: absolute;
        width: 50%;
        height: 100%;
        overflow: hidden;
    }
    .ap_link {
        left: 50%;
    }
    .db_link a, .ap_link a {
        display: inline-block;
        width: 200%;
    }
    .ap_link a {
        position: relative;
        left: -100%;
    }
    .db_link:hover {
        overflow: visible;
    }
    .db_link:hover + .ap_link a {
        display: none;
    }
    .post:hover .img_block_text:not(:hover) + .db_link:not(:hover) + .ap_link {
        overflow: visible;
    }
    .post:hover .img_block_text:not(:hover) + .db_link:not(:hover) {
        z-index: 2;
    }
    .post:hover .img_block_text:not(:hover) + .db_link:not(:hover) a {
        display: none;
    }
</style>

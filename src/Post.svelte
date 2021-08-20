<script lang="ts">
    import type { Result } from "./importer.js";
    export let post: Result;
</script>

<span class="img_block_big">
    <a  href="/pictures/view_post/{post.id}?lang=en" 
        title="Anime picture {post.width}x{post.height}" 
        target="_blank"
    >
        <picture>
            <source type="image/avif" srcset="{post.preview}.avif">
            <img class="img_cp" 
                src="{post.preview}" 
                style="box-shadow: 0 0 50px rgb({post.color});"
                alt="Anime picture #{post.id}"
            >
        </picture>
    </a>
    <div class="img_block_text" style="
        opacity: 1;
        background-image: linear-gradient(to right, rgba({post.color},0), rgba({post.color},1), rgba({post.color},0));
        color: {post.color.reduce((s,a)=>s+a) > 128*3 ? "black" : "white"};"
    > 
        <a href="/pictures/view_posts/0?res_x={post.width}&amp;res_y={post.height}&amp;lang=en" 
            title="Anime pictures {post.width}x{post.height}"
            target="_blank"
            style="background-color: {["none", "#F0F", "#F90", "#F00"][post.erotics]};"
        >
            {post.width}x{post.height}
        </a>
        <span title="Tags Num">({post.tagsCount})</span>
        <br hidden={post.status === 1}>
        {{ "-2": "PRE", 0: "NEW", 1: "", 2: "BAN" }[post.status]}
    </div>
</span>

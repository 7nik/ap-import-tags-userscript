<script lang="ts">
    import type Multiaction from "./Multiaction.svelte";
    import type { Result } from "../libs/importer";
    import type { DataProvider } from "../libs/providers";
    import APPostProvider from "../libs/providers/APDataProvider";

    export let post: Result;
    export let postSize: "150"|"300"|"500" = "300";
    export let multiaction: Multiaction;
    export let dataProvider: DataProvider<any, any>;

    $: apImg = APPostProvider.getImage(post.result, postSize);
    $: dbImg = post.source ? dataProvider.getImage(post.source, postSize) : "";
    // TODO fixme
    // @ts-ignore
    const bgcolor = unsafeWindow.is_moderator
        ? ["none", "#F0F", "#F90", "#F00"][post.result.erotics]
        : "none";
    const textColor = post.result.color.reduce((s,a)=>s+a) > 128*3 ? "black" : "white";
    const status = { "-2": "PRE", 0: "NEW", 1: "", 2: "BAN" }[post.result.status];
    // TODO fixme
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
            multiaction.apply(post.result.id).finally(() => pending = false);
        }
    }
</script>

<span class="post" class:pending>
    <div class="img_block_text" style="
        opacity: 1;
        background-image: linear-gradient(to right, transparent, rgb({post.result.color}), transparent);
        color: {textColor};"
    >
        <a href="/pictures/view_posts/0?res_x={post.result.width}&amp;res_y={post.result.height}&amp;lang=en"
            title="Anime pictures {post.result.width}x{post.result.height}"
            target="_blank"
            style="background-color: {bgcolor};"
        >
            {post.result.width}x{post.result.height}
        </a>
        <span title="Tags Num">({post.result.tags_count})</span>
        <span title="Similarity">{Math.round(+post.sim)}%</span>
        <br hidden={!!status}>
        {status}
    </div>
    <a class="db_link"
        href={post.source ? dataProvider.getLink(post.source) : ""}
        title="{dataProvider.sourceName} post"
        target="_blank"
        on:click={handleClick}
    > </a>
    <a class="ap_link"
        href="/pictures/view_post/{post.result.id}?lang={lang || "en"}"
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
        transition: opacity 0.2s 0.2s;
    }
    img {
        max-width: var(--post-size);
        max-height: var(--post-size);
    }
    .post.pending {
        transition: none;
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

<script lang="ts">
    import type { DataProvider, SimplePost } from "../libs/providers";

    import storage from "../libs/storage.svelte";
    import { getCorsImage } from "../libs/utils.svelte";

    const {
        post,
        dataProvider,
    }: {
        post: SimplePost;
        dataProvider: DataProvider<any, any>;
    } = $props();

    const getImage = dataProvider.sourceName === "Minitokyo" ? getCorsImage : <T,>(x: T): T => x;

    const imgThumb = $derived.by(
        getImage(() => dataProvider.getImage(post, storage.postSize ?? "300")),
    );
    const imgFull = $derived.by(getImage(() => dataProvider.getImage(post, "orig")));
</script>

<span class="post">
    <a
        href={dataProvider.getLink(post)}
        title="{dataProvider.sourceName} #{post.id}"
        target="_blank"
        rel="noreferrer"
    >
        {#if imgThumb.endsWith(".mp4")}
            <video
                src={imgThumb}
                muted
                autoplay
                loop
            ></video>
        {:else}
            <!-- svelte-ignore a11y_missing_attribute -->
            <img src={imgThumb} />
        {/if}
    </a>
    <div class="img_block_text">
        <a
            href={imgFull}
            title="{dataProvider.sourceName} #{post.id} - full"
            target="_blank"
            rel="noreferrer"
        >
            {post.width}x{post.height}
        </a>
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
        opacity: 1;
        background-image: linear-gradient(to right, transparent, #888, transparent);
        color: white;
    }
    .img_block_text a {
        color: inherit;
    }
    span > a {
        height: var(--post-size);
        display: block;
    }
    img,
    video {
        max-width: var(--post-size);
        max-height: var(--post-size);
    }
</style>

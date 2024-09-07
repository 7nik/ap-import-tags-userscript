<script lang="ts">
    import type { Snippet } from "svelte";

    const { title, hint, children }: { title: string; hint?: string; children: Snippet } = $props();

    function addClass(elem: HTMLElement) {
        elem.classList.add(elem.closest("#sidebar") ? "sidebar_block" : "post_content");
    }
</script>

<div use:addClass>
    <div class="title">
        {title}
        {#if hint}
            <span
                title={hint}
                class="question_icon"
            ></span>
        {/if}
    </div>
    <div class="body">
        {@render children()}
    </div>
</div>

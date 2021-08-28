<script lang="ts">
    import Block from "./Block.svelte";
    import { AnimePictures } from "./ajax.js";
    import type { AnimePicturesFullTag } from "./ajax.js";
import { onMount } from "svelte";

    let addTags = "";
    let removeTags = "";
    let cache: Record<string, AnimePicturesFullTag> = {};

    export let enabled = false;
    export const apply = async (postId: number) => {
        if (addTags) {
            await AnimePictures.addTags(addTags, postId);
        }
        if (removeTags) {
            const tags = removeTags.split("||").map(name => name.trim().toLocaleLowerCase());
            for (const tagName of tags) {
                let tag;
                if (tagName in cache) {
                    tag = cache[tagName];
                } else {
                    tag = await AnimePictures.getTagByName(tagName);
                    cache[tagName] = tag;
                }
                if (tag) AnimePictures.removeTag(tag.id, postId);
            }
        }
    };

    onMount(() => {
        // @ts-ignore
        new unsafeWindow.AnimePictures.AutoComplete("addInput", "/pictures/autocomplete_tag", true);
        // @ts-ignore
        new unsafeWindow.AnimePictures.AutoComplete("removeInput", "/pictures/autocomplete_tag", true);
    });

</script>

<svelte:options accessors={true} />
<Block title="Multiactions">
    <label>
        <input type="checkbox" bind:checked={enabled}>
        Enable multiaction
    </label>
    <br>
    <input id="addInput" placeholder="tags to add" bind:value={addTags} />
    <br>
    <input id="removeId" placeholder="tags to remove" bind:value={removeTags} />
</Block>

<style>
</style>

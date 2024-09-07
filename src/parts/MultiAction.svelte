<script lang="ts">
    import type { FullTag } from "../libs/net/AnimePictures";
    import AP from "../libs/net/AnimePictures";
    import storage from "../libs/storage.svelte";
    import Block from "./Block.svelte";
    import TagsField from "./TagsField.svelte";

    const cache: Record<string, FullTag> = {};
    let mode = $state("off");
    const disabled = $derived(mode === "off");
    const action = $derived(storage[`ma_${mode}`] ?? { addTags: "", removeTags: "" });

    export const isEnabled = () => !disabled;
    export const applyTo = async (postId: number) => {
        if (action.addTags) {
            await AP.addTags(action.addTags, postId);
        }
        if (action.removeTags) {
            const tags = action.removeTags
                .split("||")
                .map((name) => name.trim().toLocaleLowerCase())
                .filter(Boolean);
            for (const tagName of tags) {
                let tag;
                if (tagName in cache) {
                    tag = cache[tagName];
                } else {
                    // eslint-disable-next-line no-await-in-loop
                    tag = await AP.getTagByName(tagName);
                    cache[tagName] = tag;
                }
                // eslint-disable-next-line no-await-in-loop
                if (tag) await AP.removeTag(tag.id, postId);
            }
        }
    };

    function switchMode(ev: KeyboardEvent) {
        const focusElem = document.activeElement;
        // return if it is just text typing
        if (
            ev.ctrlKey ||
            ev.altKey ||
            ev.shiftKey ||
            focusElem?.tagName === "TEXTAREA" ||
            (focusElem?.tagName === "INPUT" &&
                (focusElem as HTMLInputElement).type !== "button" &&
                (focusElem as HTMLInputElement).type !== "submit")
        ) {
            return;
        }
        if (ev.key === "Escape") {
            mode = "off";
        } else if (/\d/.test(ev.key)) {
            mode = ev.key;
        }
    }
</script>

<svelte:window on:keydown={switchMode} />

<Block
    title="Multiaction"
    hint="
Click a post to apply the selected action to it.
Use numerical and Esc keys to switch between actions.
"
>
    <select bind:value={mode}>
        <option label="disabled">off</option>
        <option label="action 1">1</option>
        <option label="action 2">2</option>
        <option label="action 3">3</option>
        <option label="action 4">4</option>
        <option label="action 5">5</option>
        <option label="action 6">6</option>
        <option label="action 7">7</option>
        <option label="action 8">8</option>
        <option label="action 9">9</option>
    </select>
    <div class="break"></div>
    <TagsField
        placeholder="tags to add"
        bind:value={action.addTags}
        {disabled}
    />
    <div class="break"></div>
    <TagsField
        placeholder="tags to remove"
        bind:value={action.removeTags}
        {disabled}
    />
</Block>

<style>
    select,
    .break {
        margin-top: 10px;
    }
</style>

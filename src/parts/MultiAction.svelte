<script lang="ts">
    import type { FullTag } from "../libs/net/AnimePictures";
    import { untrack } from "svelte";
    import AP from "../libs/net/AnimePictures";
    import storage from "../libs/storage.svelte";
    import Block from "./Block.svelte";
    import TagsField from "./TagsField.svelte";

    const cache: Record<string, FullTag> = {};
    let mode = $state("");
    const action = $derived.by(() => {
        if (!mode) return null;
        if (storage[`ma_${mode}`]) return storage[`ma_${mode}`];
        const obj = $state({ addTags: "", removeTags: "" });
        if (mode) {
            untrack(() => {
                storage[`ma_${mode}`] = obj;
            });
        }
        return obj;
    });

    export const isEnabled = () => !!action;
    export const applyTo = async (postId: number) => {
        if (action!.addTags) {
            await AP.addTags!(action!.addTags, postId);
        }
        if (action!.removeTags) {
            const tags = action!.removeTags
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
            setMode("");
        } else if (/^\d$/.test(ev.key)) {
            setMode(ev.key);
        }
    }

    function setMode(m: string) {
        mode = m;
    }
</script>

<svelte:window on:keydown={switchMode} />

<Block
    title="MultiAction"
    hint="
Click a post to apply the selected action to it.
Use numerical and Esc keys to switch between actions.
"
>
    <select
        bind:value={mode}
        class="ma-select"
    >
        <option
            label="disabled"
            value="">off</option
        >
        <option label="action 1">1</option>
        <option label="action 2">2</option>
        <option label="action 3">3</option>
        <option label="action 4">4</option>
        <option label="action 5">5</option>
        <option label="action 6">6</option>
        <option label="action 7">7</option>
        <option label="action 8">8</option>
        <option label="action 9">9</option>
        <option
            label="action 10"
            value="0">10</option
        >
    </select>
    <div class="break"></div>
    <TagsField
        placeholder="tags to remove"
        bind:value={
            () => action?.removeTags ?? "",
            (v) => {
                if (action) action.removeTags = v;
            }
        }
        disabled={!action}
    />
    &nbsp;&rArr;&nbsp;
    <TagsField
        placeholder="tags to add"
        bind:value={
            () => action?.addTags ?? "",
            (v) => {
                if (action) action.addTags = v;
            }
        }
        disabled={!action}
    />
</Block>

<style>
    select {
        margin-top: 10px;
    }
    .break {
        display: inline-block;
        width: 10px;
    }
</style>

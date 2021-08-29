<script lang="ts">
    import Block from "./Block.svelte";
    import AP from "../libs/net/AnimePictures";
    import LocalValue from "../libs/localStorage";
    import { onMount } from "svelte";
    import type { AnimePicturesFullTag } from "../libs/net/AnimePictures";

    let cache: Record<string, AnimePicturesFullTag> = {};
    let mode = "off";
    let action = new LocalValue(`ma_off`, { addTags: "", removeTags: "" });

    export let enabled = false;
    export const apply = async (postId: number) => {
        if ($action.addTags) {
            await AP.addTags($action.addTags, postId);
        }
        if ($action.removeTags) {
            const tags = $action.removeTags.split("||")
                .map(name => name.trim().toLocaleLowerCase())
                .filter(name => name);
            for (const tagName of tags) {
                let tag;
                if (tagName in cache) {
                    tag = cache[tagName];
                } else {
                    tag = await AP.getTagByName(tagName);
                    cache[tagName] = tag;
                }
                if (tag) AP.removeTag(tag.id, postId);
            }
        }
    };

    $: {
        if (mode === "off") {
            enabled = false;
        } else {
            enabled = true;
            action = new LocalValue(`ma_${mode}`, { addTags: "", removeTags: "" });
        }
    }

    onMount(() => {
        // @ts-ignore
        new unsafeWindow.AnimePictures.AutoComplete("addInput", "/pictures/autocomplete_tag", true);
        // @ts-ignore
        new unsafeWindow.AnimePictures.AutoComplete("removeInput", "/pictures/autocomplete_tag", true);
    });

    function switchMode(ev: KeyboardEvent) {
        const focusElem = document.activeElement;
        // return if it is just text typing
        if (ev.ctrlKey || ev. altKey || ev.shiftKey
            || focusElem?.tagName === "TEXTAREA"
            || (focusElem?.tagName === "INPUT"
                && (focusElem as HTMLInputElement).type !== "button"
                && (focusElem as HTMLInputElement).type !== "submit")
        ) {
            return;
        }
        if (mode === ev.key) {
            mode = "off";
        } else if (ev.key.match(/\d/)) {
            mode = ev.key;
        }
    }

</script>
<svelte:window on:keypress={switchMode} />
<svelte:options accessors={true} />
<Block title="Multiaction" hint="
Click a post to apply the action to it.
Use number keys to switch between actions.
">
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
    <br>
    <input id="addInput" 
        placeholder="tags to add" 
        bind:value={$action.addTags} 
        disabled={!enabled}
    />
    <br>
    <input id="removeInput" 
        placeholder="tags to remove" 
        bind:value={$action.removeTags} 
        disabled={!enabled}
    />
</Block>

<style>
    select, input {
        margin-top: 5px;
    }
</style>

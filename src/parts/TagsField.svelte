<script lang="ts">
import type { AutocompleteTag } from "../libs/net/AnimePictures";
import AP from "../libs/net/AnimePictures";



    export let placeholder = "";
    export let autoAppend = false;
    export let appendix: "||"|"&&" = "||";
    export let value = "";
    export let disabled = false;

    let tags: (AutocompleteTag&{name:string})[] = [];
    let selTag: (AutocompleteTag&{name:string})|null = null;
    let show = false;
    let focused = false;
    $: {
        show = focused && tags.length > 0;
    }

    function getLastDelimPos () {
        const pos = Math.max(value.lastIndexOf("||"), value.lastIndexOf("&&"));
        return pos < 0 ? 0 : pos + 2;
    }

    let timer: number;
    function autocomplete () {
        const tagName = value.slice(getLastDelimPos()).trim();
        if (tagName) {
            clearTimeout(timer);
            timer = setTimeout(loadAutocomplete, 200, tagName);
        }
    }

    async function loadAutocomplete (tagName: string) {
        tags = (await AP.autocompleteTag(tagName))
            .map(t => ({...t, name: t.t2 ? t.t2 : t.t.replace("<b>","").replace("</b>","") }));
        selTag = null;
    }

    function selectTag (ev: KeyboardEvent) {
        if (ev.key === "ArrowRight" || ev.key === "Tab") {
            if (autoAppend) value += appendix;
            tags = [];
            ev.preventDefault();
        } else if (ev.key === "ArrowDown") {
            if (!selTag) {
                selTag = tags[0];
            } else {
                selTag = tags[tags.indexOf(selTag)+1] ?? tags[tags.length-1];
            }
            const pos = getLastDelimPos();
            value = (pos ?  value.slice(0, pos) : "") + (selTag?.name ?? "");
        } else if (ev.key === "ArrowUp") {
            if (selTag) {
                selTag = tags[tags.indexOf(selTag)-1] ?? tags[0];
                const pos = getLastDelimPos();
                value = (pos ?  value.slice(0, pos) : "") + (selTag?.name ?? "");
            }
        }
    }

</script>

<svelte:options accessors={true} />
<div>
    <input {placeholder} 
        bind:value autocomplete="off" 
        on:keydown={selectTag}
        on:input={autocomplete}
        on:focus={() => focused = true}
        on:blur={() => focused = false}
        {disabled}
    />
    <ul class="autocomplite" class:show>
        {#each tags as tag }
            <li class="cat-{tag.c} {tag === selTag ? "autocomplite_active" : ""}">
                {@html tag.t2 ? `${tag.t} → ${tag.t2}` : tag.t}
            </li>
        {/each}
    </ul>
</div>

<style>
    div {
        display: inline-block;
        position: relative;
    }
    ul {
        position: absolute;
        top: 100%;
        height: 0;
        width: 100%;
    }
    ul.autocomplite.show {
        visibility: visible;
    }
    .cat-1 {
        color: #006699;
    }
    .cat-3, .cat-5, .cat-6 {
        color: green;
    }
    .cat-4 {
        color: darkorange;
        font-style: italic;
    }
</style>

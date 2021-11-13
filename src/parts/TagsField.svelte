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
    let focused = false;
    $: show = focused && tags.length > 0;

    function getLastDelimPos (): number {
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

    function selectTag (ev: KeyboardEvent | MouseEvent) {
        // choose the clicked tag
        if (ev instanceof MouseEvent) {
            const elem = (ev.target as HTMLElement).closest("li");
            const list = elem?.parentNode?.children;
            if (!elem || !list) return;
            selTag = tags[[...list].indexOf(elem)];
        // choose the selected tag
        } else if (ev.key === "ArrowRight" || ev.key === "Tab") {
            if (selTag) {
                if (autoAppend) value += appendix;
                tags = [];
                selTag = null;
                (ev.target as HTMLInputElement).selectionStart = 
                    (ev.target as HTMLInputElement).selectionEnd = value.length;
                ev.preventDefault();
            }
            return;
            // select another tag
        } else if (ev.key === "ArrowDown") {
            selTag = selTag 
                ? tags[Math.min(tags.indexOf(selTag)+1, tags.length-1)]
                : tags[0];
        } else if (ev.key === "ArrowUp") {
            selTag = selTag 
                ? tags[Math.max(tags.indexOf(selTag)-1, 0)]
                : tags[tags.length-1];
        } else {
            return;
        }
        // display the selected tag in the field
        const pos = getLastDelimPos();
        value = (pos ?  value.slice(0, pos) : "") + (selTag?.name ?? "");
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
            <li 
                class="cat-{tag.c}" 
                class:autocomplite_active="{tag === selTag}"
                on:mousedown={selectTag}
            >
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

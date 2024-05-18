<script lang="ts">
    import type { DataProvider, MatchedTag } from "../libs/providers";
    import APDataProvider from "../libs/providers/APDataProvider";

    /**
     * The placeholder to display in the input field
     */
    export let placeholder = "";
    /**
     * The tag delimiters, default - `"||"`, `"&&"`
     */
    // let delimiters = [",", ";"];
    /**
     * Append the first delimiter at tag completion, default - no
     */
    export let autoAppend = false;
    /**
     * The field value
     */
    export let value = "";
    /**
     * Whether to disable the field
     */
    export let disabled = false;
    /**
     * The methods for tag autocompletion
     */
    export let dataProvider: DataProvider<any, any> = APDataProvider;

    let inputElem: HTMLInputElement;
    let tags: MatchedTag[] = [];
    let selTag: MatchedTag|null = null;
    let focused = false;
    let query = "";
    $: show = focused && tags.length > 0;

    function getCurrentTag () {
        const str = value.slice(0, inputElem.selectionStart!);
        const delim = str.match(/,\s*/);
        let pos = 0;
        if (delim) {
            pos = str.lastIndexOf(delim.at(-1)!) + delim.at(-1)!.length;
        }
        return (!pos ? str : str.slice(pos)).trim();
    }

    let timer: NodeJS.Timeout;
    function autocomplete () {
        let tagName = getCurrentTag();
        for (const prefix of dataProvider.tagPrefixes) {
            if (tagName.startsWith(prefix)) tagName = tagName.slice(prefix.length);
        }
        if (tagName) {
            clearTimeout(timer);
            timer = setTimeout(loadAutocomplete, 200, tagName);
        }
    }

    async function loadAutocomplete (tagName: string) {
        tags = await dataProvider.autocompleteTag(tagName);
        query = tagName;
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
                // if (autoAppend) value += delimiters[0];
                insertTag(selTag.mainName, true);
                tags = [];
                selTag = null;
                // (ev.target as HTMLInputElement).selectionStart =
                //     (ev.target as HTMLInputElement).selectionEnd = value.length;
                ev.preventDefault();
            }
            return;
            // select another tag
        } else if (ev.key === "ArrowDown") {
            selTag = selTag
                ? tags[Math.min(tags.indexOf(selTag)+1, tags.length-1)]
                : tags[0];
            ev.preventDefault();
        } else if (ev.key === "ArrowUp") {
            selTag = selTag
                ? tags[Math.max(tags.indexOf(selTag)-1, 0)]
                : tags[tags.length-1];
            ev.preventDefault();
        } else {
            return;
        }
        // display the selected tag in the field
        // const pos = getLastDelimPos();
        // value = (pos ?  value.slice(0, pos) : "") + (selTag?.name ?? "");
        insertTag(selTag?.mainName ?? "");
    }

    function insertTag (tagName: string, canAppend = false) {
        let oldTagName = getCurrentTag();
        for (const prefix of dataProvider.tagPrefixes) {
            if (oldTagName.startsWith(prefix)) {
                oldTagName = oldTagName.slice(prefix.length);
                tagName = prefix.concat(tagName);
            }
        }

        let beforeCaret = value.slice(0, inputElem.selectionStart!).trim();
        const delim = beforeCaret.match(/,\s*/);
        let pos = 0;
        if (delim) {
            pos = beforeCaret.lastIndexOf(delim.at(-1)!) + delim.at(-1)!.length;
        }
        beforeCaret = pos ? beforeCaret.slice(0, pos).concat(tagName) : tagName;

        const afterCaret = value.slice(inputElem.selectionStart!).trim();
        value = beforeCaret + afterCaret;
        if (canAppend && autoAppend) value += ", ";
        inputElem.selectionStart = inputElem.selectionEnd = beforeCaret.length;
    }
</script>

<svelte:options accessors={true} />
<div>
    <input {placeholder}
        type="search"
        autocomplete="off"
        bind:value
        bind:this={inputElem}
        on:keydown={selectTag}
        on:input={autocomplete}
        on:focus={() => focused = true}
        on:blur={() => focused = false}
        {disabled}
    />
    <ul class:show>
        {#each tags as tag }
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li
                class="cat-{tag.category}"
                class:active="{tag === selTag}"
                on:mousedown={selectTag}
            >
                {@html tag.matchedName.replace(query, `<b>${query}</b>`)}
                {#if tag.matchedName !== tag.mainName} → {tag.mainName}{/if}
            </li>
        {/each}
    </ul>
</div>

<style>
    div {
        display: inline-block;
        position: relative;
    }
    input {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
    ul {
        visibility: hidden;
        position: absolute;
        top: 100%;
        height: 0;
        width: 100%;
    }
    ul.show {
        visibility: visible;
    }
    li {
        background: var(--autocomplite-background);
    }
    li.active {
        background: var(--autocomplite-background-active);
    }
    .cat-0 {
        color: darkorange;
        font-style: italic;
    }
    .cat-1 {
        color: green;
    }
    .cat-2 {
        color: #006699;
    }
    .cat-3 {
        color: inherit;
    }
    .cat-4 {
        color: purple;
    }
</style>

<script lang="ts">
    import type { DataProvider, MatchedTag } from "../libs/providers";
    import APDataProvider from "../libs/providers/APDataProvider";

    type Props = {
        /**
         * The placeholder to display in the input field
         */
        placeholder?: string;
        /**
         * Append the first delimiter at tag completion, default - no
         */
        autoAppend?: boolean;
        /**
         * The field value
         */
        value: string;
        /**
         * Whether to disable the field
         */
        disabled?: boolean;
        /**
         * The methods for tag autocompletion
         */
        dataProvider?: DataProvider<any, any>;
    }

    /* eslint-disable prefer-const */
    let {
        placeholder = "",
        autoAppend = false,
        value = $bindable(),
        disabled = false,
        dataProvider = APDataProvider,
    }: Props = $props();
    /* eslint-enable prefer-const */

    let inputElem: HTMLInputElement;
    let tags: MatchedTag[] = $state([]);
    let selTag: MatchedTag|null = $state(null);
    let focused = $state(false);
    let query = $state("");
    const show = $derived(focused && tags.length > 0);

    function getCurrentTag () {
        const str = value.slice(0, inputElem.selectionStart!);
        const delim = str.match(/,\s*/);
        let pos = 0;
        if (delim) {
            pos = str.lastIndexOf(delim.at(-1)!) + delim.at(-1)!.length;
        }
        return (pos ? str.slice(pos) : str).trim();
    }

    let timer: number;
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
        } else {
            switch (ev.key) {
                // choose the selected tag
                case "Tab":
                case "ArrowRight":
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
                // select tag below
                case "ArrowDown":
                    selTag = selTag
                        ? tags[Math.min(tags.indexOf(selTag) + 1, tags.length - 1)]
                        : tags[0] ?? null;
                    ev.preventDefault();
                    break;
                // select tag above
                case "ArrowUp":
                    selTag = selTag
                        ? tags[Math.max(tags.indexOf(selTag) - 1, 0)]
                        : tags.at(-1) ?? null;
                    ev.preventDefault();
                    break;
                default:
                    return;
            }
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
        inputElem.selectionStart = beforeCaret.length;
        inputElem.selectionEnd = beforeCaret.length;
    }
</script>

<div>
    <input {placeholder}
        type="search"
        autocomplete="off"
        bind:value
        bind:this={inputElem}
        onkeydown={selectTag}
        oninput={autocomplete}
        onfocus={() => { focused = true; }}
        onblur={() => { focused = false; }}
        {disabled}
    />
    <ul class:show>
        {#each tags as tag }
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                class="cat-{tag.category}"
                class:active="{tag === selTag}"
                onmousedown={selectTag}
            >
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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

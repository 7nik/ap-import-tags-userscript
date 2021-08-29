<script lang="ts">
	import Block from "../parts/Block.svelte";
	import LocalValue from "../libs/localStorage";
    import { replace } from "svelte-spa-router"; 
    import { get } from 'svelte/store';
    import type { SavedResult } from "../libs/importer";

	const dbkey = new LocalValue("dbkey", "");
	const snkey = new LocalValue("snkey", "");
    let searches = LocalValue.listValues()
        .sort().reverse()
        .filter((name) => name.startsWith("res_"))
        .map((name) => get(new LocalValue(name, {} as SavedResult)));
	let form: HTMLFormElement;
	let query = "murata_range giselle_collette_vingt";

    function startImport (ev: Event) {
		if (!form.checkValidity()) return;
        ev.preventDefault();
        replace(`/import/${encodeURIComponent(query)}`);
    }

    function deleteResult (search: SavedResult) {
        searches = searches.filter((s) => s !== search);
        new LocalValue(`res_${search.date}`, {}).delete();
    }
</script>

<Block title="New import">
    <form bind:this={form}>
        <span>Search on:</span> <span>Danbooru</span>
        <span>Search query:</span>
        <input type="text" placeholder="Query to search on Danbooru" required bind:value={query}/>
        <!-- <span>Exclude tags:</span>
        <input type="text" placeholder="Anime-pictures' tags to exlude (optional)"/> -->
        <span>Danbooru key:</span>
        <input 
            type="text" 
            placeholder="Danbooru login, space, API key (desired)" 
            bind:value={$dbkey}
            pattern=".+ \w{"{24}"}"
        />
        <span>SauceNAO key:</span>
        <input 
            type="text" 
            placeholder="SauceNAO API key (optional)" 
            bind:value={$snkey}
            pattern="[0-9a-f]{"{40}"}"
        /> 
        <input type="submit" value="Start importing" 
            on:click={startImport} 
            on:submit={startImport}
        />
    </form>
</Block>

<Block title="Previous imports">
    {#each searches as search}
        <div>
            <a href="#/res/{search.date}/0">{search.query}</a>
            <span class="icon_delete" on:click={() => deleteResult(search)} />
            <br>
            {search.count} found pictures {new Date(search.date).toLocaleString()},
        </div>
    {:else}
        No saved imports!
    {/each}
</Block>

<style>
	form {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 5px;
	}
	input[type="submit"] {
		grid-column: 1/3;
    	margin: 10px auto;
	}
    div {
        border-bottom: 1px solid #8888;
        padding: 10px 0;
    }
    div:first-child {
        padding-top: 0;
    }
    div:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
    .icon_delete {
        cursor: pointer;
        margin-bottom: -2px;
    }
</style>

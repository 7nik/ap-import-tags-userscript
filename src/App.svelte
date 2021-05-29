<script lang="ts">
	import Block from "./Block.svelte";
	import LocalValue from "./localStorage.js";

	const dbkey = new LocalValue("dbkey", "");
	const snkey = new LocalValue("snkey", "");

</script>

<Block title="New import">
	Search on: Danbooru <br>
	Search query: <input type="text" placeholder="Query to search on Danbooru"> <br>
	Exclude tags: <input type="text" placeholder="Anime-pictures' tags to exlude (optional)"> <br>
	Danbooru key: <input type="text" placeholder="Danbooru API key (optional)" bind:value={$dbkey}> <br>
	SauceNAO key: <input type="text" placeholder="SauceNAO API key (optional)" bind:value={$snkey}> <br>
	<input type="button" value="Start importing">
</Block>

<Block title="Previous imports">
	No saved imports!
</Block>

<style>
</style>
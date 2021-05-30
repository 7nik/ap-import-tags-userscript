<script lang="ts">
	import Block from "./Block.svelte";
	import LocalValue from "./localStorage.js";
	import { AnimePictures, Danbooru, SauceNAO } from "./ajax.js";

	const dbkey = new LocalValue("dbkey", "");
	const snkey = new LocalValue("snkey", "");

	async function test () {
		console.log(await Danbooru.postCount("murata_range giselle_collette_vingt"));
		const pics = await Danbooru.findPosts("murata_range giselle_collette_vingt");
		console.log(pics);
		console.log(await SauceNAO.availableAttempts());
		const search = await SauceNAO.findClosestOnAnimePictures(pics[0].preview_file_url ?? "");
		console.log(search);
		console.log(await AnimePictures.getPostInfo(search.data["anime-pictures_id"]));
	}

</script>

<Block title="New import">
	Search on: Danbooru <br>
	Search query: <input type="text" placeholder="Query to search on Danbooru"> <br>
	Exclude tags: <input type="text" placeholder="Anime-pictures' tags to exlude (optional)"> <br>
	Danbooru key: <input type="text" placeholder="Danbooru login and API key (optional)" bind:value={$dbkey}> <br>
	SauceNAO key: <input type="text" placeholder="SauceNAO API key (optional)" bind:value={$snkey}> <br>
	<input type="button" value="Start importing" on:click={test}>
</Block>

<Block title="Previous imports">
	No saved imports!
</Block>

<style>
</style>

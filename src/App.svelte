<script lang="ts">
	import Block from "./Block.svelte";
	import { value } from "./permMemory.ts";

	const dbkey = value("dbkey", "dbkey");
	const snkey = value("snkey", "snkey");

</script>

<Block title="New import">
	Search on: Danbooru <br>
	Search query: <input type="text" name="query"> <br>
	Exclude tags: <input type="text" name="except"> <br>
	Danbooru key: <input type="text" name="dbkey" bind:value={$dbkey}> <br>
	SauceNAO key: <input type="text" name="snkey" bind:value={$snkey}> <br>
	<input type="button" value="Start importing">
</Block>

<Block title="Previous imports">
	No saved imports!
</Block>

<style>
</style>
<script lang="ts" module>
	import Block from "./Block.svelte";
	import TagImporter from "./importer.js";
	import { replace } from "svelte-spa-router";

	export let params: { query:string }; 

	let importer = new TagImporter(params.query);
	let state = importer.state;
	$: { 
		if ($state.finished) {
			replace("/home"); 
		}
	}
	let pending = true;

	toggle();

	async function toggle () {
		if ($state.paused) {
			// if couldn't resume due to low number of available attempts
			try {
				if (!await importer.resume()) {
					const { availableAttempts: av, requiredAttempts: req } = $state;
					if (confirm(`There are no enough available search attempts on SauceNAO: only ${av} of ${req}, continue?`)) {
						importer.resume(true);
					}
				}
			} catch (ex) {
				console.error(ex);
			}
		} else {
			importer.pause();
		}
		pending = false;
	}

	function cancel() {
		if (confirm("Are you sure that you want cancel importing? All progress will be lost!")) {
			importer.pause();
			replace("/home");
		}
	}

	function onleave(ev: BeforeUnloadEvent) {
		if ($state.finished) return;
		ev.preventDefault();
		return (ev.returnValue = "If you leave the page you'll lost all the progress! Leave the page?");
	}

</script>

<svelte:window on:beforeunload={onleave} />
<Block title="Importing tags">
	{#if $state.error}
		<span class="red">Error: {$state.error}</span>
		<br>
	{/if}
	<span>{$state.status}</span>
    <progress max="100" value={$state.progress} />
    <center>
        <input 
			type="button" 
			value={$state.paused ? "resume" : "pause"} 
			on:click={toggle} 
			disabled={pending} 
		/>
        {#if !$state.finished} 
			<input type="button" value="cancel" on:click={cancel} />
		{/if}
    </center>
</Block>

<style>
	progress {
		width: 100%;
	}
	.red {
		color: red;
	}
</style>

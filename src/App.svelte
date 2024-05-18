<script lang="ts">
	import HomePage from "./pages/HomePage.svelte";
	import ImportPage from "./pages/ImportPage.svelte";
	import ViewResultsPage from "./pages/ViewResultsPage.svelte";
	import LocalValue from "./libs/localStorage";
	import Router, { push } from "svelte-spa-router";
	import AnimePictures from "./libs/net/AnimePictures";
	import searcher from "./libs/searcher";
	import Block from "./parts/Block.svelte";
	import { writable } from "svelte/store";
    import { onDestroy } from "svelte";

	const pageSize = new LocalValue("pageSize", 20);
	AnimePictures.userData().then((res) => {
		if ($pageSize !== res.user.jvwall_ipp) {
			$pageSize = res.user.jvwall_ipp;
		}
	});

	let progress = writable(146);
	const form = document.querySelector("#sidebar form");
	const input = form?.querySelector("[type=search]") as HTMLInputElement
	const button = form?.querySelector("[type=submit]") as HTMLInputElement
	input?.addEventListener("keydown", doSearch, true);
	button?.addEventListener("click", doSearch, true);
	function doSearch (ev: Event) {
		if (ev instanceof KeyboardEvent && ev.key !== "Enter") return;
		ev.preventDefault();
		ev.stopPropagation();
		progress = searcher(input.value);
	};
	$: if ($progress === 100) { push("/res/search/0"); }

	onDestroy(() => {
		input?.removeEventListener("keydown", doSearch);
		button?.removeEventListener("click", doSearch);
	})

	const routes = {
		"/home": HomePage,
		"/import/:provider/:query": ImportPage,
		"/res/:name/:page": ViewResultsPage,
		"*": HomePage,
	};
</script>

<Router {routes} />

{#if $progress < 100 }
	<div>
		<Block title="Searching">
			Gathering the pictures of {input.value}
			<br>
			<progress max="100" value={$progress} />
		</Block>
	</div>
{/if}

<style>
	div {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		background: #000C;
		z-index: 15;
	}
	div > :global(div) {
		margin: auto;
	}
	progress {
		width: 100%;
	}
</style>

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

	const pageSize = new LocalValue("pageSize", 20);
	AnimePictures.searchPosts(0, {}).then((res) => {
		if ($pageSize !== res.posts.length) {
			$pageSize = res.posts.length;
		}
	});

	let progress = writable(146);
	const form = document.querySelector("#sidebar form");
	const input = document.getElementById("side_search_tag") as HTMLInputElement
	form?.addEventListener("submit", (ev) => {
		ev.preventDefault();
		progress = searcher(input.value);
	});
	$: if ($progress === 100) { push("/res/search/0"); }

	const routes = {
		"/home": HomePage,
		"/import/:query": ImportPage,
		"/res/:name/:page": ViewResultsPage,
		"*": HomePage,
	};
</script>

<Router {routes} />

{#if $progress < 100 }
	<div>
		<Block title="Searching">
			Geathering the pictures of {input.value}
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

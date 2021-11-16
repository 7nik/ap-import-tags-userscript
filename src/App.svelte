<script lang="ts">
	import HomePage from "./pages/HomePage.svelte";
	import ImportPage from "./pages/ImportPage.svelte";
	import ViewResultsPage from "./pages/ViewResultsPage.svelte";
	import LocalValue from "./libs/localStorage";
	import Router from "svelte-spa-router";
	import AnimePictures from "./libs/net/AnimePictures";

	const pageSize = new LocalValue("pageSize", 20);
	AnimePictures.searchPosts(0, {}).then((res) => {
		if ($pageSize !== res.posts.length) {
			$pageSize = res.posts.length;
		}
	});

	const routes = {
		"/home": HomePage,
		"/import/:query": ImportPage,
		"/res/:name/:page": ViewResultsPage,
		"*": HomePage,
	};
</script>

<Router {routes} />

<style>
</style>

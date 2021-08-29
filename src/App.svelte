<script lang="ts">
	import HomePage from "./pages/HomePage.svelte";
	import ImportPage from "./pages/ImportPage.svelte";
	import ViewResultsPage from "./pages/ViewResultsPage.svelte";
	import Router from "svelte-spa-router";

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

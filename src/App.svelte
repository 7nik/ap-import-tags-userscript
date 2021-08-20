<script lang="ts">
	import HomePage from "./HomePage.svelte";
	import ImportPage from "./ImportPage.svelte";
	import Router from "svelte-spa-router";
	import ViewResult from "./ViewResult.svelte";

	const routes = {
		"*": HomePage,
		"/home": HomePage,
		"/import/:query": ImportPage,
		"/res/:name/:page": ViewResult,
	};
</script>

<Router {routes} />

<style>
</style>

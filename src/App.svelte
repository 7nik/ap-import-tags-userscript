<script lang="ts">
	import HomePage from "./HomePage.svelte";
	import ImportPage from "./ImportPage.svelte";
	import Router from "svelte-spa-router";

	const routes = {
		"/": HomePage,
		"/home": HomePage,
		"/import/:query": ImportPage,
	};
</script>

<Router {routes} />

<style>
</style>

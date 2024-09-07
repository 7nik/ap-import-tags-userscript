<script lang="ts">
    import Router from "svelte-spa-router";
    import AP from "./libs/net/AnimePictures";
    import storage from "./libs/storage.svelte";
    import HomePage from "./pages/HomePage.svelte";
    import MatchPage from "./pages/MatchPage.svelte";
    import ViewResultsPage from "./pages/ViewResultsPage.svelte";

    AP.userData().then((res) => {
        if (storage.pageSize !== res.user.jvwall_ipp) {
            storage.pageSize = res.user.jvwall_ipp;
        }
        if (storage.isModerator !== res.user.groups.includes("moderator")) {
            storage.isModerator = res.user.groups.includes("moderator");
        }
    });

    const routes = {
        "/home": HomePage,
        "/match/:provider/:query": MatchPage,
        "/res/:name/:page": ViewResultsPage,
        "*": HomePage,
    };
</script>

<Router {routes} />

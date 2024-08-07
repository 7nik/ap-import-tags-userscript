<script lang="ts">
    import { replace } from "svelte-spa-router";
    import TagImporter from "../libs/importer.svelte";
    import dataProviders from "../libs/providers";
    import Block from "../parts/Block.svelte";

    const { params }: { params: { query:string, provider:string }} = $props();

    const importer = new TagImporter(dataProviders[params.provider], params.query);
    $effect(() => {
        if (importer.state.finished) replace("/home");
    });
    let pending = $state(true);

    toggle();

    async function toggle () {
        if (importer.state.paused) {
            // if couldn't resume due to low number of available attempts
            try {
                if (!await importer.resume()) {
                    const { availableAttempts: av, requiredAttempts: req } = importer.state;
                    // eslint-disable-next-line no-restricted-globals
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

    function cancel () {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure that you want cancel importing? All progress will be lost!")) {
            importer.pause();
            replace("/home");
        }
    }

    function onbeforeunload (ev: BeforeUnloadEvent) {
        if (!importer.state.finished) {
            ev.preventDefault();
        }
    }

</script>

<svelte:window {onbeforeunload} />
<Block title="Importing tags">
    {#if importer.state.error !== null}
        <span class="red">Error: {importer.state.error}</span>
        <br>
    {/if}
    <span>{importer.state.status}</span>
    <progress max="100" value={importer.state.progress}></progress>
    <center>
        <input
            type="button"
            value={importer.state.paused ? "resume" : "pause"}
            onclick={toggle}
            disabled={pending}
        />
        {#if !importer.state.finished}
            <input type="button" value="cancel" onclick={cancel} />
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

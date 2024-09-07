<script lang="ts">
    import { replace } from "svelte-spa-router";
    import TagImporter from "../libs/importer.svelte";
    import dataProviders from "../libs/providers";
    import Block from "../parts/Block.svelte";

    const { params }: { params: { query: string; provider: string } } = $props();

    const importer = new TagImporter(dataProviders[params.provider], params.query);
    $effect(() => {
        if (importer.state.finished) replace("/home");
    });
    let pending = $state(true);

    start(false);

    async function start(repeat: boolean) {
        if (!importer.state.paused) {
            importer.pause();
            return;
        }
        // if couldn't resume due to low number of available attempts
        try {
            pending = true;
            if (await importer.resume(repeat)) {
                return;
            }
            const { availableAttempts, requiredAttempts } = importer.state;
            if (
                // eslint-disable-next-line no-restricted-globals, no-alert, max-len
                confirm(
                    `The import requires ~${requiredAttempts} searches,
                    but on SauceNAO you have only ${availableAttempts} tries for now.
                    Continue?`,
                )
            ) {
                importer.resume(repeat, true);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            pending = false;
        }
    }

    function cancel() {
        // eslint-disable-next-line no-restricted-globals, no-alert
        if (confirm("Are you sure that you want cancel importing? All progress will be lost!")) {
            importer.pause();
            replace("/home");
        }
    }

    function onbeforeunload(ev: BeforeUnloadEvent) {
        if (!importer.state.finished) {
            ev.preventDefault();
        }
    }
</script>

<svelte:window {onbeforeunload} />

<Block title="Importing tags">
    {#if importer.state.error !== null}
        <span class="red">Error: {importer.state.error}</span>
        <br />
    {/if}
    <span>{importer.state.status}</span>
    <progress
        max="100"
        value={importer.state.progress}
    ></progress>
    <center>
        {#if importer.state.paused}
            <input
                type="button"
                value="retry"
                onclick={() => start(true)}
                disabled={pending}
            />
            <input
                type="button"
                value="resume"
                onclick={() => start(false)}
                disabled={pending}
            />
        {:else}
            <input
                type="button"
                value="pause"
                onclick={() => importer.pause()}
                disabled={pending}
            />
        {/if}
        <input
            type="button"
            value="cancel"
            onclick={cancel}
        />
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

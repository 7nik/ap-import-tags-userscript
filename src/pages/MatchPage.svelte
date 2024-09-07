<script lang="ts">
    import { replace } from "svelte-spa-router";
    import PostMatcher from "../libs/matcher.svelte";
    import dataProviders from "../libs/providers";
    import Block from "../parts/Block.svelte";

    const { params }: { params: { query: string; provider: string } } = $props();

    const matcher = new PostMatcher(dataProviders[params.provider], params.query);
    $effect(() => {
        if (matcher.state.finished) replace("/home");
    });
    let pending = $state(true);

    start(false);

    async function start(repeat: boolean) {
        if (!matcher.state.paused) {
            matcher.pause();
            return;
        }
        // if couldn't resume due to low number of available attempts
        try {
            pending = true;
            if (await matcher.resume(repeat)) {
                return;
            }
            const { availableAttempts, requiredAttempts } = matcher.state;
            if (
                // eslint-disable-next-line no-restricted-globals, no-alert, max-len
                confirm(
                    `The matching requires ~${requiredAttempts} searches,
                    but on SauceNAO you have only ${availableAttempts} tries for now.
                    Continue?`,
                )
            ) {
                matcher.resume(repeat, true);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            pending = false;
        }
    }

    function cancel() {
        // eslint-disable-next-line no-restricted-globals, no-alert
        if (confirm("Are you sure that you want cancel matching? All progress will be lost!")) {
            matcher.pause();
            replace("/home");
        }
    }

    function onbeforeunload(ev: BeforeUnloadEvent) {
        if (!matcher.state.finished) {
            ev.preventDefault();
        }
    }
</script>

<svelte:window {onbeforeunload} />

<Block title="Matching posts">
    {#if matcher.state.error !== null}
        <span class="red">Error: {matcher.state.error}</span>
        <br />
    {/if}
    <span>{matcher.state.status}</span>
    <progress
        max="100"
        value={matcher.state.progress}
    ></progress>
    <center>
        {#if matcher.state.paused}
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
                onclick={() => matcher.pause()}
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

<script lant="ts">
import { onMount } from "svelte";


	export let title = "";
	export let hint = "";

	let elem;
	let className = "";
	onMount(() => {
		className = elem.closest("#sidebar")
			? "sidebar_block"
			: "post_content";
	});
</script>

<div bind:this={elem} class={className}>
	<div class="title">
		{title}
		{#if hint}
			<span title={hint} class="question_icon" />
		{/if}
	</div>
	<div class="body">
		<slot></slot>
	</div>
</div>

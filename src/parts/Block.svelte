<script lang="ts">
	export let title = "";
	export let hint = "";

	function addClass (elem: HTMLElement) {
		elem.classList.add(elem.closest("#sidebar")
			? "sidebar_block"
			: "post_content");
	}
</script>

<div use:addClass>
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

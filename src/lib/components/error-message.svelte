<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		message: string | undefined;
	}

	let { message }: Props = $props();
</script>

<div class="h-4 text-sm">
	{#if message}
		<span class="italic text-red-500" in:fade out:fade>{message}</span>
	{:else}
		<span>{'\u00A0'}</span>
	{/if}
</div>

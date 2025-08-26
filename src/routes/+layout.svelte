<script lang="ts">
	import { Toaster } from 'svelte-french-toast';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Toaster />

<div
	class="sticky top-0 z-50 flex items-center justify-between border-b-[1px] bg-neutral-100 p-4 shadow-sm"
>
	<a href="/" class="select-none text-xl font-bold" data-sveltekit-preload-data>Wantify</a>

	{#if data.user.isGuest}
		<a href="/auth/sign-in" class="select-none underline" data-sveltekit-preload-data>Sign In</a>
	{:else}
		<div>
			<span>
				{data.user.githubUsername ??
					data.user.discordUsername ??
					data.user.googleUsername ??
					'user'}:
			</span>
			<a href="/auth/sign-out" class="select-none underline" data-sveltekit-preload-data>Sign Out</a
			>
		</div>
	{/if}
</div>

{@render children()}


<style>
	:global(body) {
		background-color: hsl(0, 0%, 96.1%);
		/* same as neutral 100 */
	}
</style>

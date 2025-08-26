<script lang="ts">
	import { Toaster } from 'svelte-french-toast';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { beforeNavigate } from '$app/navigation';
	import { maybeScale } from '$lib/custom-transitions/maybe-scale';
	import { maybeFade } from '$lib/custom-transitions/maybe-fade';

	let { data, children }: LayoutProps = $props();
	let animateOnce = $state(false);

	const HOME = '/';
	const DETAILS = '/wishlist/[id]';

	function shouldAnimate(from: string, to: string) {
		const isHomeToDetails = from === HOME && to === DETAILS;
		const isDetailsToHome = from === DETAILS && to === HOME;
		return isHomeToDetails || isDetailsToHome;
	}

	beforeNavigate((nav) => {
		if (!nav.to) return;
		const from = nav.from?.route.id ?? '';
		const to = nav.to.route.id ?? '';
		animateOnce = shouldAnimate(from, to);
	});
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

{#key data.url}
	<div
		in:maybeScale={{ duration: 175, delay: 150, enabled: animateOnce }}
		out:maybeFade={{ duration: 175, enabled: animateOnce }}
		onintroend={() => (animateOnce = false)}
	>
		{@render children()}
	</div>
{/key}

<style>
	:global(body) {
		background-color: hsl(0, 0%, 96.1%);
		/* same as neutral 100 */
	}
</style>

<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-french-toast';
	import type { LayoutProps } from './$types';
	import CircleUser from 'lucide-svelte/icons/circle-user';
	import Settings from 'lucide-svelte/icons/settings';
	import LogOut from 'lucide-svelte/icons/log-out';

	let { data, children }: LayoutProps = $props();
	let showDropdown = $state(false);
	let dropdownContainer: HTMLDivElement | undefined = $state();

	const toggleDropdown = () => {
		showDropdown = !showDropdown;
	};

	const closeDropdown = () => {
		showDropdown = false;
	};

	$effect(() => {
		if (!showDropdown) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
				closeDropdown();
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
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
		<div class="relative" bind:this={dropdownContainer}>
			<button
				class="flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-neutral-200"
				onclick={toggleDropdown}
			>
				<CircleUser size={20} />
				<span>
					{data.user.username ?? 'user'}
				</span>
			</button>

			{#if showDropdown}
				<div
					class="absolute right-0 top-full mt-2 w-48 rounded-md border border-neutral-300 bg-white shadow-lg"
				>
					<a
						href="/user/{data.user.id}"
						class="flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-neutral-100"
						onclick={closeDropdown}
						data-sveltekit-preload-data
					>
						<Settings size={16} />
						Settings
					</a>
					<a
						href="/api/v1/auth/sign-out"
						rel="external"
						class="flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-neutral-100"
						onclick={closeDropdown}
					>
						<LogOut size={16} />
						Sign Out
					</a>
				</div>
			{/if}
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

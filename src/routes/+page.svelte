<script lang="ts">
	import { Lock, LockOpen, Plus, Share2, Trash2 } from 'lucide-svelte';
	import type { PageData } from './$types';
	import type { Wishlist } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/modal.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data }: { data: PageData } = $props();
	let modal: any;
	let isModalOpen: boolean = $state(false);
	let clickedWishlist: string = $state('');

	const submitDeleteWishlist: SubmitFunction = ({ formData, action, cancel }) => {
		return async ({ result, update }) => {
			modal.clear();
			await update();
		};
	};
</script>

{#snippet wishlistComponent(wishlist: Wishlist)}
	<div class="flex h-44 w-[312px] flex-col justify-between rounded-lg bg-white pl-4 shadow-sm">
		<div class="p-1">
			<p class="font-bold">{wishlist.name}</p>
			<p class="italic text-gray-400">{wishlist.isLocked ? 'Locked' : 'Unlocked'}</p>
		</div>

		<div class="flex items-center gap-3 pb-4">
			<a href={`/wishlist/${wishlist.id}`} class="rounded-md border-2 px-2 py-1 shadow-sm">Expand</a
			>
			<form method="POST" class="w-fit" use:enhance>
				<button class="rounded-md border-2 px-2 py-1 shadow-sm" formaction="?/lockWishlist">
					{#if wishlist.isLocked}
						<Lock size="20" />
					{:else}
						<LockOpen size="20" />
					{/if}
				</button>
				<button class="rounded-md border-2 px-2 py-1 shadow-sm" type="button">
					<Share2 size="20" />
				</button>
				<button
					class="rounded-md border-2 border-red-600 bg-red-500 px-2 py-1 text-white shadow-sm"
					type="button"
					onclick={() => {
						isModalOpen = true;
						clickedWishlist = wishlist.id;
					}}
				>
					<Trash2 size="20" />
				</button>
				<input class="hidden" name="wishlistId" value={wishlist.id} />
				<input class="hidden" name="isLocked" value={wishlist.isLocked} />
			</form>
		</div>
	</div>
{/snippet}

{#snippet addMore()}
	<div
		class="flex h-44 w-[312px] flex-col justify-center rounded-lg border-2 border-dashed bg-blue-100 shadow-sm group-disabled:bg-neutral-300"
	>
		<div
			class="gap- flex items-center justify-center font-bold text-blue-700 group-disabled:text-neutral-500"
		>
			<Plus size={20} />
			<p>Create New List</p>
		</div>
	</div>
{/snippet}

<!-- <main class="flex flex-wrap items-center justify-center gap-4 px-10 pt-12"> -->
<!-- need like an autosave feature for creating new wishlists, since we manually add items no need to autosave that -->
<main
	class="grid grid-cols-1 items-center justify-center gap-4 p-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
>
	{#await data.wishlists then wishlists}
		{#each wishlists as wishlist (wishlist.id)}
			{@render wishlistComponent(wishlist)}
		{/each}

		<form method="POST" action="?/createWishlist" class="w-fit" use:enhance>
			<button class="group w-fit" disabled={data.isGuestUser && wishlists.length > 0}>
				{@render addMore()}
			</button>
		</form>
	{/await}

	<Modal
		id="delete-wishlist-modal"
		isOpen={isModalOpen}
		onModalClose={() => (isModalOpen = !isModalOpen)}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
		bind:this={modal}
	>
		<div class="flex flex-col items-center gap-3">
			<button
				class="flex size-9 items-center justify-center self-end rounded-full bg-stone-200"
				onclick={() => modal.clear()}
			>
				&times;
			</button>
			<span class="flex flex-col items-center justify-center gap-1">
				<p class="text-2xl font-bold">Are you sure?</p>
				<p class="text-md text-center text-neutral-500">
					Are you sure you want to delete this item? This action cannot be undone.
				</p>
			</span>
			<div class="flex items-center justify-center gap-2">
				<button class="rounded-md border-2 border-black px-4 py-2" onclick={() => modal.clear()}
					>Cancel</button
				>
				<form method="POST" action="?/deleteWishlist" use:enhance={submitDeleteWishlist}>
					<button class="rounded-md text-red-500 px-4 py-2 bg-red-100">Delete</button>
					<input class="hidden" name="wishlistId" value={clickedWishlist} />
				</form>
			</div>
		</div>
	</Modal>
</main>

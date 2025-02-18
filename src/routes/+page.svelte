<script lang="ts">
	import { Lock, LockOpen, Plus, Share2, Trash2, TriangleAlert } from 'lucide-svelte';
	import type { PageData } from './$types';
	import type { Wishlist } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/modal.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { wishlistSchema } from '$lib/schema';

	let modal: Modal;
	let { data }: { data: PageData } = $props();

	let isModalOpen: boolean = $state(false);
	let isCreatingNewWishlist: boolean = $state(false);
	let clickedWishlist: string = $state('');
	let isWishlistsLoading: boolean = $state(true);
	let loadedWishlists: Wishlist[] = $state([]);

	const submitDeleteWishlist: SubmitFunction = () => {
		return async ({ update }) => {
			modal.close();
			await update({ reset: true, invalidateAll: true });
		};
	};

	const submitCreateWishlist: SubmitFunction = () => {
		isCreatingNewWishlist = true;
		return async ({ update }) => {
			await update();
			isCreatingNewWishlist = false;
		};
	};

	const submitLockWishlist: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const resultData = result.data;
				if (resultData) {
					const updatedWishlist = wishlistSchema.parse(resultData['wishlist'][0]);
					loadedWishlists.forEach((loadedWishlist) => {
						if (loadedWishlist.id === updatedWishlist.id) {
							loadedWishlist.updatedAt = updatedWishlist.updatedAt;
							loadedWishlist.isLocked = updatedWishlist.isLocked;
						}
					});
				}
			}
			await update({ invalidateAll: false });
		};
	};

	$effect(() => {
		data.wishlists.then((wishlists) => {
			loadedWishlists = wishlists;
			isWishlistsLoading = false;
		});
	});
</script>

{#snippet wishlistComponent(wishlist: Wishlist)}
	<div class="flex h-44 w-[312px] flex-col justify-between rounded-lg bg-white pl-4 shadow-sm">
		<div class="p-1">
			<p class="font-bold">{wishlist.name}</p>
			<p class="italic text-gray-400">{wishlist.isLocked ? 'Locked' : 'Unlocked'}</p>
		</div>

		<div class="flex items-center gap-3 pb-4">
			<a
				href={`/wishlist/${wishlist.id}`}
				class="transform select-none rounded-md border-2 px-2 py-1 shadow-sm transition duration-100 active:scale-90"
				>Expand</a
			>
			<form method="POST" class="w-fit" use:enhance={submitLockWishlist}>
				<button
					class="transform select-none rounded-md border-2 px-2 py-1 shadow-sm transition duration-100 active:scale-90"
					formaction="?/lockWishlist"
				>
					{#if wishlist.isLocked}
						<Lock size="20" />
					{:else}
						<LockOpen size="20" />
					{/if}
				</button>
				<input type="hidden" class="hidden" name="wishlistId" value={wishlist.id} />
				<input type="hidden" class="hidden" name="isLocked" value={wishlist.isLocked} />
			</form>
			<button class="select-none rounded-md border-2 px-2 py-1 shadow-sm" type="button">
				<Share2 size="20" />
			</button>
			<button
				class="transform select-none rounded-md border-2 border-red-600 bg-red-500 px-2 py-1 text-white shadow-sm transition duration-100 active:scale-90 active:opacity-85"
				type="button"
				onclick={() => {
					isModalOpen = true;
					clickedWishlist = wishlist.id;
				}}
			>
				<Trash2 size="20" />
			</button>
		</div>
	</div>
{/snippet}

{#snippet addMore()}
	<div
		class="flex h-44 w-[312px] flex-col justify-center rounded-lg border-2 border-solid bg-blue-100 shadow-sm group-disabled:border-neutral-500 group-disabled:bg-neutral-300"
	>
		<div
			class="gap- flex select-none items-center justify-center font-bold text-blue-700 group-disabled:text-neutral-500"
		>
			<Plus size={20} />
			<p class="select-none">Create New List</p>
		</div>
	</div>
{/snippet}

<main>
	<ul
		class="grid grid-cols-1 items-center justify-center justify-items-center gap-y-4 p-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4"
	>
		{#if isWishlistsLoading}
			<div>Loading...</div>
		{:else}
			{#each loadedWishlists.filter((loadedWishlist) => !loadedWishlist.isDeleted) as wishlist (wishlist.id)}
				<li>{@render wishlistComponent(wishlist)}</li>
			{/each}

			<li>
				<form
					method="POST"
					action="?/createWishlist"
					class="w-fit"
					use:enhance={submitCreateWishlist}
				>
					<button
						class="group w-fit disabled:cursor-not-allowed"
						disabled={(data.isGuestUser && loadedWishlists.length === 1) || isCreatingNewWishlist}
					>
						{@render addMore()}
					</button>
				</form>
			</li>
		{/if}
	</ul>

	<Modal
		id="delete-wishlist-modal"
		isOpen={isModalOpen}
		onModalClose={() => (isModalOpen = !isModalOpen)}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
		bind:this={modal}
	>
		<div class="flex flex-col items-center gap-3">
			<button
				class="flex size-9 transform select-none items-center justify-center self-end rounded-full bg-stone-200 shadow-md transition duration-100 active:scale-90"
				onclick={() => modal.close()}
			>
				&times;
			</button>
			<span class="rounded-md bg-red-100 p-3 text-red-500">
				<TriangleAlert />
			</span>
			<span class="flex flex-col items-center justify-center gap-1">
				<p class="text-2xl font-bold">Are you sure?</p>
				<p class="text-md text-center text-neutral-500">
					Are you sure you want to delete this wishlist? This action cannot be undone.
				</p>
			</span>
			<div class="flex items-center justify-center gap-2">
				<button
					class="transform select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
					onclick={() => modal.close()}>Cancel</button
				>
				<form method="POST" action="?/deleteWishlist" use:enhance={submitDeleteWishlist}>
					<button
						class="transform select-none rounded-md border-2 border-red-500 bg-red-100 px-4 py-2 text-red-500 shadow-lg transition duration-100 active:scale-90"
						>Delete</button
					>
					<input type="hidden" class="hidden" name="wishlistId" value={clickedWishlist} />
				</form>
			</div>
		</div>
	</Modal>
</main>

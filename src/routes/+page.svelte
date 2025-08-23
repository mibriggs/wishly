<script lang="ts">
	import { ClipboardCheck, Plus, TriangleAlert } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import type { Wishlist } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/modal.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import toast from 'svelte-french-toast';
	import WishlistBlock from '$lib/components/wishlist-block.svelte';

	let deleteWishlistModal: Modal;
	let copyWishlistModal: Modal;

	let { data }: PageProps = $props();

	let isDeleteModalOpen: boolean = $state(false);
	let isCopyModalOpen: boolean = $state(false);

	let isCreatingNewWishlist: boolean = $state(false);
	let clickedWishlist: string = $state('');
	let isWishlistsLoading: boolean = $state(true);
	let loadedWishlists: Wishlist[] = $state([]);
	let shareLink: string = $state('');

	const submitDeleteWishlist: SubmitFunction = ({ formData }) => {
		formData.append('wishlistId', clickedWishlist);
		loadedWishlists.filter(list => list.id === clickedWishlist).forEach(list => list.isDeleted = true);

		return async ({ update, result }) => {
			if (result.type === 'success') {
				toast.success('Wishlist deleted');
			}
			if (result.type === 'failure') {
				toast.error('Failed to delete wishlist');
			}
			if (result.type === 'error') {
				toast.error('An error ocurred');
			}
			deleteWishlistModal.close();
			await update({ reset: true, invalidateAll: true });
		};
	};

	const submitCreateWishlist: SubmitFunction = () => {
		isCreatingNewWishlist = true;
		return async ({ update, result }) => {
			await update();
			isCreatingNewWishlist = false;
			if (result.type === 'failure') {
				toast.error('Could not create wishlist');
			}
			if (result.type === 'success') {
				toast.success('New wishlist created');
			}
		};
	};

	const updateModalVisibility = (clickedId: string) => {
		isDeleteModalOpen = true;
		clickedWishlist = clickedId;
	};

	const openCopyModal = (link: string) => {
		isCopyModalOpen = true;
		shareLink = link;
	};

	const copyToClipboard = () => {
		copyText(shareLink);
		toast.success('Link copied to clipboard!');
		copyWishlistModal.close();
	};

	const copyText = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			console.log('Copied:', text);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const updateWishlistLock = (id: string, isLocked: boolean, updatedAt: Date) => {
		loadedWishlists.forEach((wishlist) => {
			if (wishlist.id === id) {
				wishlist.isLocked = isLocked;
				wishlist.updatedAt = updatedAt;
			}
		});
	};

	$effect(() => {
		data.wishlists.then((wishlists) => {
			loadedWishlists = wishlists;
			isWishlistsLoading = false;
		});
	});
</script>

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
				<li>
					<WishlistBlock
						{loadedWishlists}
						{wishlist}
						onLock={updateWishlistLock}
						onShareClicked={openCopyModal}
						onDeleteClicked={() => updateModalVisibility(wishlist.id)}
					/>
				</li>
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
		isOpen={isDeleteModalOpen}
		onModalClose={() => (isDeleteModalOpen = !isDeleteModalOpen)}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
		bind:this={deleteWishlistModal}
	>
		<div class="flex flex-col items-center gap-3">
			<button
				class="flex size-9 transform select-none items-center justify-center self-end rounded-full bg-stone-200 text-gray-400 shadow-md ring-2 ring-gray-400 transition duration-100 focus:outline-none active:scale-90"
				onclick={() => deleteWishlistModal.close()}
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
					onclick={() => deleteWishlistModal.close()}>Cancel</button
				>
				<form method="POST" action="?/deleteWishlist" use:enhance={submitDeleteWishlist}>
					<button
						class="transform select-none rounded-md border-2 border-red-500 bg-red-100 px-4 py-2 text-red-500 shadow-lg transition duration-100 active:scale-90"
						>Delete</button
					>
				</form>
			</div>
		</div>
	</Modal>

	<Modal
		id="copy-wishlist-modal"
		isOpen={isCopyModalOpen}
		onModalClose={() => (isCopyModalOpen = !isCopyModalOpen)}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
		bind:this={copyWishlistModal}
	>
		<div class="flex flex-col items-center gap-3">
			<button
				class="flex size-9 transform select-none items-center justify-center self-end rounded-full bg-stone-200 text-gray-400 shadow-md ring-2 ring-gray-400 transition duration-100 focus:outline-none active:scale-90"
				onclick={() => copyWishlistModal.close()}
			>
				&times;
			</button>
			<span class="rounded-md bg-blue-100 p-3 text-blue-500">
				<ClipboardCheck />
			</span>
			<span class="flex flex-col items-center justify-center gap-1">
				<p class="text-2xl font-bold">Are you sure?</p>
				<p class="text-md text-center text-neutral-500">This link will be copied to clipboard</p>
			</span>
			<div class="flex items-center justify-center gap-2">
				<button
					class="transform select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
					onclick={() => copyWishlistModal.close()}>Cancel</button
				>
				<button
					class="transform select-none rounded-md border-2 border-blue-500 bg-blue-100 px-4 py-2 text-blue-500 shadow-lg transition duration-100 active:scale-90"
					onclick={copyToClipboard}
				>
					Copy
				</button>
			</div>
		</div>
	</Modal>
</main>

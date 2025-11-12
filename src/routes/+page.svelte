<script lang="ts">
	import Plus from 'lucide-svelte/icons/plus';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
	import type { PageProps } from './$types';
	import type { Wishlist } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/modal.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import toast from 'svelte-french-toast';
	import WishlistBlock from '$lib/components/wishlist-block.svelte';
	import LoadingSpinner from '$lib/components/loading-spinner.svelte';
	import { fade, scale } from 'svelte/transition';
	import { poofOut } from '$lib/custom-transitions/poof-out';
	import ListSkeleton from '$lib/components/list-skeleton.svelte';

	type ShareData = {
		title: string;
		text: string;
		url: string;
	};

	class StreamedWishlist {
		wishlists: Wishlist[] = $state([]);
		nonDeletedWishlists: Wishlist[] = $derived(
			this.wishlists.filter((loadedWishlist) => !loadedWishlist.isDeleted)
		);
		async streamWishlists() {
			this.wishlists = await data.wishlists;
		}
	}

	const wishlistsData = new StreamedWishlist();

	let deleteWishlistModal: Modal;
	let copyWishlistModal: Modal;

	let { data }: PageProps = $props();

	let isDeleteModalOpen: boolean = $state(false);
	let isCopyModalOpen: boolean = $state(false);

	let clickedWishlist: string = $state('');
	let shareLink: string = $state('');

	let creating: boolean = $state(false);
	let deleting: boolean = $state(false);

	const submitDeleteWishlist: SubmitFunction = ({ formData }) => {
		formData.append('wishlistId', clickedWishlist);
		const loadingId = toast.loading('Deleting...');
		deleting = true;

		return async ({ update, result }) => {
			if (result.type === 'success' && result.data) {
				const deleteSucceed = result.data.success;
				if (deleteSucceed === true) {
					toast.success('Wishlist deleted', { id: loadingId });
					await update({ invalidateAll: false });
					const deletedWishlist = result.data.wishlist as Wishlist;
					wishlistsData.nonDeletedWishlists
						.filter((list) => list.id === deletedWishlist.id)
						.forEach((list) => (list.isDeleted = true));
				} else {
					toast.error('Failed to delete wishlist', { id: loadingId });
					await update({ reset: true, invalidateAll: true });
				}
			} else if (result.type === 'failure') {
				toast.error('Failed to delete wishlist', { id: loadingId });
				await update({ reset: true, invalidateAll: true });
			} else if (result.type === 'error') {
				toast.error('An error ocurred'), { id: loadingId };
				await update({ reset: true, invalidateAll: true });
			}
			deleteWishlistModal.close();
			deleting = false;
		};
	};

	const submitCreateWishlist: SubmitFunction = () => {
		creating = true;
		const loadingId = toast.loading('Loading...');

		return async ({ update, result }) => {
			creating = false;
			if (result.type === 'failure') {
				toast.error('Could not create wishlist', { id: loadingId });
				await update();
			}
			if (result.type === 'success' && result.data) {
				const newWishlist = result.data.wishlist as Wishlist;
				wishlistsData.wishlists.unshift(newWishlist);
				toast.success('New wishlist created', { id: loadingId });
				await update({ invalidateAll: false });
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

	const shareOrCopyLink = async () => {
		const shareData: ShareData = {
			title: 'Wishlist',
			text: 'Checkout my wishlist!',
			url: shareLink
		};

		try {
			if (!canUseWebShareApi(shareData)) {
				throw new Error('Web Share unavailable for this payload/env');
			}
			await shareLinkToGuest(shareData);
		} catch (err: any) {
			if (err?.name === 'AbortError') {
				toast.error('Share cancelled');
				return;
			}

			const warningId = toast('Failed to share, copying link', { icon: '⚠️' });
			const isCopied = await copyText(shareLink);
			if (isCopied) {
				toast.success('Link copied to clipboard!', { id: warningId });
			} else {
				toast.error('Failed to copy to clipboard, try again', { id: warningId });
			}
		} finally {
			copyWishlistModal.close();
		}
	};

	const canUseWebShareApi = (shareDate: ShareData) => {
		return (
			navigator &&
			typeof navigator.share === 'function' &&
			(typeof navigator.canShare !== 'function' || navigator.canShare(shareDate))
		);
	};

	const shareLinkToGuest = async (shareData: ShareData) => {
		await navigator.share(shareData);
		console.log('Shared');
		toast.success('Link shared!');
	};

	const copyText = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			console.log('Copied:', text);
			return true;
		} catch (err) {
			console.error('Failed to copy:', err);
			return false;
		}
	};

	const updateWishlistLock = (id: string, isLocked: boolean, updatedAt: Date) => {
		wishlistsData.wishlists.forEach((wishlist) => {
			if (wishlist.id === id) {
				wishlist.isLocked = isLocked;
				wishlist.updatedAt = updatedAt;
			}
		});
	};

	let transitionOver: boolean = $state(false);
</script>

{#snippet addMore()}
	<div
		class="flex h-44 w-[312px] flex-col justify-center rounded-lg border-2 border-solid bg-blue-100 shadow-sm group-disabled:border-neutral-500 group-disabled:bg-neutral-300"
	>
		<div
			class="gap- flex select-none items-center justify-center font-bold text-blue-500 group-disabled:text-neutral-500"
		>
			<Plus size={20} />
			<p class="select-none">Create New List</p>
		</div>
	</div>
{/snippet}

{#await wishlistsData.streamWishlists()}
	<div out:fade onoutroend={() => (transitionOver = true)}>
		<ListSkeleton />
	</div>
{:then _}
	{#if transitionOver}
		<main in:fade>
			<ul
				class="grid grid-cols-1 items-center justify-center justify-items-center gap-y-4 p-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4"
			>
				{#each wishlistsData.nonDeletedWishlists as wishlist (wishlist.id)}
					<li
						in:scale
						out:poofOut={{
							duration: 600,
							scaleTo: 0.5,
							poofScale: 0.75,
							poofColor: '#7890B4'
						}}
					>
						<WishlistBlock
							{wishlist}
							loadedWishlists={wishlistsData.wishlists}
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
							disabled={(data.isGuestUser && wishlistsData.nonDeletedWishlists.length === 1) ||
								creating}
						>
							{#if creating}
								<div
									class="flex h-44 w-[312px] items-center justify-center rounded-lg border-2 border-solid border-neutral-500 bg-neutral-300 shadow-sm"
								>
									<LoadingSpinner class="h-20 w-20 fill-neutral-500" />
								</div>
							{:else}
								{@render addMore()}
							{/if}
						</button>
					</form>
				</li>
			</ul>
		</main>
	{/if}
{:catch}
	<div>An error has occurred</div>
{/await}

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
					disabled={deleting}
				>
					Delete
				</button>
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
			<p class="text-md text-center text-neutral-500">This link will be shared</p>
		</span>
		<div class="flex items-center justify-center gap-2">
			<button
				class="transform select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
				onclick={() => copyWishlistModal.close()}>Cancel</button
			>
			<button
				class="transform select-none rounded-md border-2 border-blue-500 bg-blue-100 px-4 py-2 text-blue-500 shadow-lg transition duration-100 active:scale-90"
				onclick={shareOrCopyLink}
			>
				Share
			</button>
		</div>
	</div>
</Modal>

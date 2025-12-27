<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import Plus from 'lucide-svelte/icons/plus';
	import SquarePen from 'lucide-svelte/icons/square-pen';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import X from 'lucide-svelte/icons/x';
	import type { PageProps } from './$types';
	import Modal from '$lib/components/modal.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { twJoin } from 'tailwind-merge';
	import NumberStepper from '$lib/components/number-stepper.svelte';
	import { type Wishlist, type WishlistItem } from '$lib/server/db/schema';
	import { fade, scale, slide } from 'svelte/transition';
	import { tick } from 'svelte';
	import toast from 'svelte-french-toast';
	import { WishlistItemStateClass } from './item-state.svelte';
	import { ValidationStateClass } from './validation-state.svelte';
	import ErrorMessage from '$lib/components/error-message.svelte';
	import DetailsSkeleton from '$lib/components/details-skeleton.svelte';
	import { createFormHandler } from '$lib/utils/form-handler';
	import { wishlistItemSchema } from '$lib/schema';
	import { z } from 'zod';

	let { data }: PageProps = $props();

	type PageState = 'idle' | 'creating' | 'updating' | 'deleting' | 'renaming' | 'loading';
	class StreamedWishlistItems {
		wishlist: Wishlist | undefined = $state();
		items: WishlistItem[] = $state([]);
		visibleItems = $derived(this.items.filter((item) => !item.isDeleted));

		async streamWishlistItems() {
			const { wishlist: streamedWishlist, items: streamedItems } = await data.streamed;
			this.wishlist = streamedWishlist;
			this.items = streamedItems;
		}
	}

	const wishlistData = new StreamedWishlistItems();
	const itemState = new WishlistItemStateClass();
	const validationState = new ValidationStateClass();

	let pageState: PageState = $state<PageState>('loading');
	const disabled = $derived(validationState.disabled || pageState !== 'idle');

	const submitNewItem: SubmitFunction = createFormHandler<{ created: WishlistItem }>({
		onStart: (formData) => {
			pageState = 'creating';
			if (wishlistData.wishlist) {
				formData.append('wishlistId', wishlistData.wishlist.id);
				formData.append('itemQuantity', `${itemState.quantity}`);
			}
		},
		onSuccess: async (data) => {
			itemState.closeModal('NEW');
			itemState.reset();
			validationState.reset();
			wishlistData.items.push(data.created);
			pageState = 'idle';
		},
		onError: (errorData) => {
			if (errorData) {
				validationState.updateErrors(errorData);
			}
			pageState = 'idle';
			return { resetForm: false, invalidateAll: false };
		},
		successSchema: z.object({ created: wishlistItemSchema }),
		loadingMessage: 'Loading...',
		successMessage: 'New item created',
		errorMessage: 'Could not create item',
		invalidateAll: false,
		resetForm: false
	});

	const submitEditItem: SubmitFunction = ({ formData }) => {
		pageState = 'updating';
		const loadingId = toast.loading('Updating...');

		if (wishlistData.wishlist && itemState.itemToEdit) {
			formData.append('wishlistId', wishlistData.wishlist.id);
			formData.append('itemId', itemState.itemToEdit.id);
			formData.append('itemQuantity', `${itemState.quantity}`);
		}

		return async ({ update, result }) => {
			if (result.type === 'failure') {
				const errorDetails = result.data;
				if (errorDetails) {
					validationState.updateErrors(errorDetails);
				}
				const errorMessage =
					errorDetails && 'errorCause' in errorDetails
						? (errorDetails.errorCause as string)
						: 'Could not update item';

				toast.error(errorMessage, { id: loadingId });
				await update({ reset: false, invalidateAll: false });
			} else if (result.type === 'success') {
				const updatedItem = result.data as { updated: WishlistItem };
				itemState.closeModal('NEW');
				itemState.reset();
				validationState.reset();
				toast.success('Item updated', { id: loadingId });

				// Update the item in the list
				const index = wishlistData.items.findIndex((item) => item.id === updatedItem.updated.id);
				if (index !== -1) {
					wishlistData.items[index] = updatedItem.updated;
				}
				await update({ invalidateAll: false });
			}
			pageState = 'idle';
		};
	};

	const submitItem: SubmitFunction = (params) => {
		if (itemState.mode === 'add') {
			return submitNewItem(params);
		} else {
			return submitEditItem(params);
		}
	};

	const submitDeleteWishlistItem: SubmitFunction = createFormHandler<{ deleted: WishlistItem }>({
		onStart: (formData) => {
			pageState = 'deleting';
			if (itemState.itemToDelete) {
				formData.append('itemId', itemState.itemToDelete.id);
			}

			if (wishlistData.wishlist) {
				formData.append('wishlistId', wishlistData.wishlist.id);
			}
		},
		onSuccess: (data) => {
			wishlistData.items
				.filter((item) => item.id === data.deleted.id)
				.forEach((item) => (item.isDeleted = true));
			itemState.closeModal('DELETE');
			pageState = 'idle';
		},
		onError: () => {
			itemState.closeModal('DELETE');
			pageState = 'idle';
		},
		successSchema: z.object({ deleted: wishlistItemSchema }),
		successMessage: 'Item Deleted',
		loadingMessage: 'Deleting...',
		invalidateAll: false
	});

	const submitNameChange: SubmitFunction = ({ formData }) => {
		const renamingId = toast.loading('Renaming...');
		pageState = 'renaming';
		if (wishlistData.wishlist) {
			formData.append('newName', itemState.newName);
			formData.append('oldName', wishlistData.wishlist.name);
			formData.append('wishlistId', wishlistData.wishlist.id);
		}

		itemState.isNameEditable = false;
		return async ({ update, result }) => {
			if (result.type === 'failure') {
				if (itemState.wishlistNameElement && wishlistData.wishlist) {
					itemState.wishlistNameElement.innerText = wishlistData.wishlist.name;
				}
				const failureData = result.data;
				if (failureData) {
					const errorCause: string | undefined = failureData['errorCause'];
					if (errorCause) {
						toast.error(errorCause, { id: renamingId });
					}
				}
			} else if (result.type === 'success') {
				toast.success('Renamed!', { id: renamingId });
			}
			await update({ reset: true, invalidateAll: false });
			pageState = 'idle';
		};
	};

	// const submitNameChangeV2: SubmitFunction = createFormHandler<void>({
	// 	onStart: (formData) => {
	// 		pageState = 'renaming';
	// 		if (wishlistData.wishlist) {
	// 			formData.append('newName', itemState.newName);
	// 			formData.append('oldName', wishlistData.wishlist.name);
	// 			formData.append('wishlistId', wishlistData.wishlist.id);
	// 		}
	// 		itemState.isNameEditable = false;
	// 	},
	// 	onSuccess: () => {
	// 		pageState = 'idle';
	// 	},
	// 	onError: () => {
	// 		if (itemState.wishlistNameElement && wishlistData.wishlist) {
	// 			itemState.wishlistNameElement.innerText = wishlistData.wishlist.name;
	// 		}
	// 	},
	// 	successSchema: z.void(),
	// 	successMessage: 'Renamed!',
	// 	loadingMessage: 'Renaming...'
	// });

	const handleItemDelete = (selectedItem: WishlistItem) => {
		itemState.itemToDelete = selectedItem;
		itemState.isDeleteItemModalOpen = true;
	};

	const handleItemEdit = (selectedItem: WishlistItem) => {
		validationState.reset();
		itemState.openEditModal(selectedItem);

		// Validate pre-populated fields so button becomes enabled
		validationState.validateName(selectedItem.itemName);
		validationState.validateUrl(selectedItem.url);
		validationState.validateCost(parseFloat(selectedItem.price));
	};

	const handleEditName = async () => {
		itemState.isNameEditable = true;

		await tick();

		itemState.wishlistNameElement?.focus();

		setTimeout(() => {
			if (!itemState.wishlistNameElement) return;

			const range = document.createRange();
			range.selectNodeContents(itemState.wishlistNameElement);

			const selection = window.getSelection();

			if (!selection) return;
			selection.removeAllRanges();
			selection.addRange(range);
		}, 50);
	};

	const handleInput = () => {
		const currentWishlistName = itemState.wishlistNameElement?.innerText.trim();
		if (currentWishlistName) {
			itemState.newName = currentWishlistName;
		}
	};

	const revertWishlistName = () => {
		itemState.isNameEditable = false;

		if (itemState.wishlistNameElement && wishlistData.wishlist) {
			itemState.wishlistNameElement.innerText = wishlistData.wishlist.name;
		}
	};
</script>

{#snippet itemComponent(wishlistItem: WishlistItem)}
	<!-- everywhere else -->
	<div
		class="hidden w-11/12 items-center justify-start gap-4 rounded-md border border-black bg-white px-8 py-3 shadow-md sm:flex md:w-3/4 xl:w-1/3"
	>
		<p class="rounded-md bg-neutral-300 p-5">📦</p>
		<span class="flex flex-col justify-center">
			<p class=" text-lg font-semibold">{wishlistItem.itemName}</p>
			<a href={wishlistItem.url} target="_blank" class=" text-blue-600 underline underline-offset-1"
				>View Product</a
			>
			<p class="text-sm italic text-neutral-500">
				${wishlistItem.price} per unit • {wishlistItem.quantity} pcs
			</p>
		</span>
		<span class="ml-auto flex items-center gap-4">
			<button
				class="transform rounded-md p-3 transition duration-150 hover:bg-amber-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
				disabled={wishlistData.wishlist?.isLocked}
				onclick={() => handleItemEdit(wishlistItem)}
			>
				<SquarePen color={wishlistData.wishlist?.isLocked ? '#737373' : '#F59E0B'} />
			</button>
			<button
				class="transform rounded-md p-3 transition duration-150 hover:bg-red-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
				disabled={wishlistData.wishlist?.isLocked}
				onclick={() => handleItemDelete(wishlistItem)}
			>
				<Trash2 color={wishlistData.wishlist?.isLocked ? '#737373' : '#EF4444'} />
			</button>
		</span>
	</div>

	<!-- phone screens -->
	<div
		class="flex w-full items-start justify-between gap-4 rounded-md border border-black bg-white p-3 sm:hidden"
	>
		<p class="rounded-md bg-neutral-300 px-4 py-3">📦</p>

		<span>
			<p class=" text-lg font-semibold">{wishlistItem.itemName}</p>
			<a href={wishlistItem.url} target="_blank" class=" text-blue-600 underline underline-offset-1"
				>View Product</a
			>
			<p class="text-sm italic text-neutral-500">
				${wishlistItem.price} per unit • {wishlistItem.quantity} pcs
			</p>
		</span>

		<span class="flex gap-2 self-end">
			<button
				class="transform rounded-md p-2 transition duration-150 hover:bg-amber-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
				disabled={wishlistData.wishlist?.isLocked}
				onclick={() => handleItemEdit(wishlistItem)}
			>
				<SquarePen color={wishlistData.wishlist?.isLocked ? '#737373' : '#F59E0B'} size="20" />
			</button>
			<button
				class="transform rounded-md p-2 transition duration-150 hover:bg-red-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
				disabled={wishlistData.wishlist?.isLocked}
				onclick={() => handleItemDelete(wishlistItem)}
			>
				<Trash2 color={wishlistData.wishlist?.isLocked ? '#737373' : '#EF4444'} size="20" />
			</button>
		</span>
	</div>
{/snippet}

{#await wishlistData.streamWishlistItems()}
	<div out:fade onoutroend={() => (pageState = 'idle')}>
		<DetailsSkeleton />
	</div>
{:then _}
	{#if pageState !== 'loading'}
		<main class="w-full p-4" in:fade>
			<div class="mb-4 flex items-center gap-4">
				<h1
					bind:this={itemState.wishlistNameElement}
					class="py-2 text-xl font-bold focus:bg-white"
					oninput={handleInput}
					contenteditable={itemState.isNameEditable}
					dir="ltr"
				>
					{wishlistData.wishlist?.name}
				</h1>
				{#if !itemState.isNameEditable}
					<button
						class="transform p-2 transition duration-150 active:scale-90 disabled:cursor-not-allowed disabled:text-neutral-500 disabled:active:scale-100"
						onclick={handleEditName}
						disabled={pageState === 'renaming' || wishlistData.wishlist?.isLocked}
					>
						<SquarePen />
					</button>
				{:else}
					<button
						class="transform rounded-md border bg-white p-2 text-red-500 shadow-sm transition duration-150 active:scale-90"
						onclick={revertWishlistName}><X size="20" /></button
					>
					<form method="POST" action="?/updateWishlistName" use:enhance={submitNameChange}>
						<button
							class=" transform rounded-md border bg-white p-2 text-green-500 shadow-sm transition duration-150 active:scale-90"
							><Check size="20" /></button
						>
					</form>
				{/if}
			</div>
			<h2 class="mb-1 text-lg font-semibold text-neutral-600">Shipping Address</h2>

			<div class="mb-4 flex w-full flex-col gap-3">
				<input
					type="text"
					placeholder="Street Address"
					class="w-full rounded-md border-2 p-2 md:w-3/4 lg:w-1/2"
				/>
				<span class="flex items-center gap-4">
					<input type="text" placeholder="City" class="w-1/3 rounded-md border-2 p-2" />
					<input type="text" placeholder="State" class="w-[96px] rounded-md border-2 p-2" />
					<input type="text" placeholder="Zip Code" class="w-[96px] rounded-md border-2 p-2" />
				</span>
			</div>

			{#if wishlistData.visibleItems.length === 0}
				<p class="italic text-neutral-500">No items added yet</p>
			{:else}
				<ul class="flex w-full flex-col gap-3.5">
					{#each wishlistData.visibleItems as wishlistItem (wishlistItem.id)}
						<li in:slide out:scale>
							{@render itemComponent(wishlistItem)}
						</li>
					{/each}
				</ul>
			{/if}

			<button
				aria-label="open new item modal"
				class="mt-4 flex transform select-none items-center justify-center gap-1 rounded-md bg-black px-6 py-1 text-neutral-100 transition duration-150 active:scale-90 disabled:cursor-not-allowed disabled:border-neutral-400 disabled:bg-neutral-500 disabled:active:scale-100"
				disabled={wishlistData.wishlist?.isLocked}
				onclick={() => itemState.openAddModal()}
			>
				<Plus size={16} />
				<p>Add an item</p>
			</button>
		</main>
	{/if}
{:catch}
	<div>An error has occurred</div>
{/await}

<Modal
	id="new-item-modal"
	bind:this={itemState.newItemModal}
	isOpen={itemState.isNewItemModalOpen}
	onModalClose={() => itemState.updateModalState(!itemState.isNewItemModalOpen, 'NEW')}
	class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
>
	<div class="flex w-full flex-col gap-1">
		<button
			class="flex size-9 transform items-center justify-center self-end rounded-full bg-stone-200 text-gray-400 shadow-md ring-2 ring-gray-400 transition duration-150 focus:outline-none active:scale-90"
			type="button"
			aria-label="close new item modal"
			onclick={() => itemState.closeModal('NEW')}
		>
			&times;
		</button>
		<form class="flex flex-col gap-2" method="POST" use:enhance={submitItem}>
			<span class="flex flex-col items-start justify-center gap-1">
				<input
					type="text"
					name="itemName"
					placeholder="Product name..."
					class={twJoin(
						'w-3/4 rounded-md border p-1 focus:outline-none',
						validationState.nameError && 'border-red-500'
					)}
					onchange={() => validationState.validateName(itemState.name)}
					bind:value={itemState.name}
				/>
				<ErrorMessage message={validationState.nameError} />
			</span>

			<span class="flex flex-col items-start justify-center gap-1">
				<input
					type="text"
					inputmode="url"
					autocomplete="url"
					autocapitalize="off"
					autocorrect="off"
					spellcheck="false"
					name="itemUrl"
					placeholder="Url..."
					class={twJoin(
						'w-3/4 rounded-md border p-1 focus:outline-none',
						validationState.urlError && 'border-red-500'
					)}
					onchange={() => validationState.validateUrl(itemState.url)}
					bind:value={itemState.url}
				/>
				<ErrorMessage message={validationState.urlError} />
			</span>

			<span class="flex flex-col items-start justify-center gap-1">
				<NumberStepper bind:value={itemState.quantity} />
				<ErrorMessage message={validationState.quantityError} />
			</span>

			<span class="flex flex-col items-start justify-center gap-1">
				<span
					class={twJoin(
						'flex items-center gap-1 rounded-md text-2xl',
						validationState.costError ? 'ring-1 ring-red-500' : 'ring-0'
					)}
				>
					<label for="itemCost" class="select-none">$</label>
					<input
						type="text"
						inputmode="decimal"
						placeholder="00.00"
						class="focus:outline-none"
						id="itemCost"
						name="itemCost"
						onchange={() => validationState.validateCost(itemState.cost)}
						bind:value={itemState.cost}
					/>
				</span>
				<ErrorMessage message={validationState.costError} />
			</span>
			<span class="mt-1 flex gap-2 self-center">
				<button
					type="button"
					aria-label="close new item modal"
					class="transform cursor-pointer select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-150 active:scale-90"
					onclick={() => itemState.closeModal('NEW')}
				>
					Cancel
				</button>
				<button
					formaction={itemState.mode === 'add' ? '?/createWishlistItem' : '?/updateWishlistItem'}
					aria-label={itemState.mode === 'add' ? 'create new item' : 'update item'}
					class="transform select-none rounded-md border-2 border-green-500 bg-green-100 px-4 py-2 text-green-500 shadow-lg transition duration-150 active:scale-90 disabled:cursor-not-allowed disabled:border-neutral-500 disabled:bg-neutral-300 disabled:text-neutral-500"
					{disabled}
				>
					{itemState.mode === 'add' ? 'Add to Wishlist' : 'Update Item'}
				</button>
			</span>
		</form>
	</div>
</Modal>

<Modal
	id="delete-item-modal"
	bind:this={itemState.deleteItemModal}
	isOpen={itemState.isDeleteItemModalOpen}
	onModalClose={() => itemState.updateModalState(!itemState.deleteItemModal, 'DELETE')}
	class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
>
	<div class="flex flex-col items-center gap-3">
		<button
			class="flex size-9 transform select-none items-center justify-center self-end rounded-full bg-stone-200 text-gray-400 shadow-md ring-2 ring-gray-400 transition duration-150 focus:outline-none active:scale-90"
			onclick={() => itemState.closeModal('DELETE')}
		>
			&times;
		</button>
		<span class="rounded-md bg-red-100 p-3 text-red-500">
			<TriangleAlert />
		</span>
		<span class="flex flex-col items-center justify-center gap-1">
			<p class="text-2xl font-bold">Are you sure?</p>
			<p class="text-md text-center text-neutral-500">
				Are you sure you want to delete <span class="font-bold"
					>{itemState.itemToDelete?.itemName}</span
				>? This action cannot be undone.
			</p>
		</span>
		<div class="flex items-center justify-center gap-2">
			<button
				class="transform select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-150 active:scale-90"
				onclick={() => itemState.closeModal('DELETE')}>Cancel</button
			>
			<form method="POST" action="?/deleteWishlistItem" use:enhance={submitDeleteWishlistItem}>
				<button
					class="transform select-none rounded-md border-2 border-red-500 bg-red-100 px-4 py-2 text-red-500 shadow-lg transition duration-150 active:scale-90"
					disabled={pageState === 'deleting'}
				>
					Delete
				</button>
			</form>
		</div>
	</div>
</Modal>

<style>
	h1[contenteditable='true'] {
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		border-radius: 0.375rem;
	}

	h1 {
		transition: padding 0.3s ease;
	}
</style>

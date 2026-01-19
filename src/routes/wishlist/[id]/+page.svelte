<script lang="ts">
	import DetailsSkeleton from '$lib/components/details-skeleton.svelte';
	import AddressAutofill from '$lib/components/address-autofill.svelte';
	import WishlistItemCard from '$lib/components/wishlist-item-card.svelte';
	import Modal from '$lib/components/modal.svelte';
	import toast from 'svelte-french-toast';
	import { fade, scale, slide } from 'svelte/transition';
	import { getWishlistQuery } from './get-wishlist.remote';
	import { WishlistItemStateClass } from './item-state.svelte';
	import { Check, Plus, SquarePen, TriangleAlert, X } from 'lucide-svelte';
	import { deleteItemCommand } from './delete-item.remote';
	import { getErrorMessage } from '$lib';
	import { renameWishlistCommand } from './rename-wishlist.remote';
	import type { WishlistItem } from '$lib/server/db/schema';
	import { createItemForm } from './new-item.remote';
	import { type AddressData, type PageState } from '$lib/schema';
	import { page } from '$app/state';
	import { editItemForm } from './edit-item.remote';
	import NewItemForm from '$lib/components/new-item-form.svelte';
	import EditItemForm from '$lib/components/edit-item-form.svelte';
	import { saveAddressCommand } from './address.remote';

	const wishlistData = getWishlistQuery();
	const itemState = new WishlistItemStateClass();

	let pageState: PageState = $state<PageState>('loading');
	let addressFormElement: HTMLFormElement | undefined = $state();

	const handleItemDelete = (selectedItem: WishlistItem) => {
		itemState.itemToDelete = selectedItem;
		itemState.isDeleteItemModalOpen = true;
	};

	const setFocusOnHeaderElement = async () => {
		itemState.isNameEditable = true;

		requestAnimationFrame(() => {
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
		});
	};

	const revertNameChange = () => {
		itemState.isNameEditable = false;
		if (itemState.wishlistNameElement && wishlistData.current) {
			itemState.wishlistNameElement.innerText = wishlistData.current.wishlist.name;
		}
	};

	const renameWishlist = async () => {
		const renamingId = toast.loading('Renaming...');
		pageState = 'renaming';

		if (!itemState.wishlistNameElement) return;
		if (!wishlistData.current) return;

		const nameToSave =
			itemState.wishlistNameElement.innerText.trim().length === 0
				? wishlistData.current.wishlist.name
				: itemState.wishlistNameElement?.innerText;

		try {
			await renameWishlistCommand({
				newName: nameToSave,
				wishlistId: wishlistData.current.wishlist.id
			});
			toast.success('Renamed!', { id: renamingId });
		} catch (e: unknown) {
			const errorMessage = getErrorMessage(e);
			toast.error(errorMessage, { id: renamingId });
			console.error(e);
			itemState.wishlistNameElement.innerText = wishlistData.current.wishlist.name;
		} finally {
			itemState.isNameEditable = false;
			pageState = 'idle';
		}
	};

	const deleteWishlistItem = async () => {
		pageState = 'deleting';
		const deletionId = toast.loading('Deleting...');
		if (!itemState.itemToDelete || !wishlistData.current?.wishlist) {
			toast.error('No wishlist item to delete', { id: deletionId });
			pageState = 'idle';
			return;
		}

		try {
			const itemId = itemState.itemToDelete.id;
			const wishlistId = wishlistData.current.wishlist.id;
			await deleteItemCommand({ itemId, wishlistId }).updates(
				getWishlistQuery().withOverride((curr) => {
					return {
						...curr,
						items: curr.items.filter((item) => item.id !== itemId && !curr.wishlist.isLocked)
					};
				})
			);
			itemState.closeModal('DELETE');
			toast.success('Item Deleted!', { id: deletionId });
		} catch (e: unknown) {
			const errorMessage = getErrorMessage(e);
			itemState.closeModal('DELETE');
			toast.error(errorMessage, { id: deletionId });
			console.error(e);
		} finally {
			pageState = 'idle';
		}
	};

	const saveWishlistAddress = async (address: AddressData) => {
		pageState = 'updating';
		const loadingId = toast.loading('Updating wishlist address...');
		try {
			await saveAddressCommand(address).updates(
				getWishlistQuery().withOverride((curr) => {
					return {
						wishlist: {
							...curr.wishlist,
							streetAddress: address.streetAddress,
							streetAddress2: address.addressLine2,
							city: address.city,
							state: address.state,
							zipCode: address.zipCode
						},
						items: [...curr.items]
					};
				})
			);
			toast.success('Address Saved!', { id: loadingId });
		} catch (e: unknown) {
			const errorMessage = getErrorMessage(e);
			toast.error(errorMessage);
			console.error(e, { id: loadingId });
			addressFormElement?.reset();
		} finally {
			pageState = 'idle';
		}
	};

	const initializeEditForm = (itemToEdit: WishlistItem) => {
		editItemForm.fields.set({
			itemId: itemToEdit.id,
			itemName: itemToEdit.itemName,
			itemUrl: itemToEdit.url,
			itemQuantity: itemToEdit.quantity,
			itemCost: itemToEdit.price
		});
	};
</script>

{#if wishlistData.loading}
	<div out:fade onoutroend={() => (pageState = 'idle')}>
		<DetailsSkeleton />
	</div>
{:else if wishlistData.current?.wishlist && pageState !== 'loading'}
	<main class="w-full p-4" in:fade>
		<div class="mb-4 flex items-center gap-4">
			<h1
				bind:this={itemState.wishlistNameElement}
				class="py-2 text-xl font-bold focus:bg-white"
				contenteditable={itemState.isNameEditable}
				dir="ltr"
			>
				{wishlistData.current?.wishlist.name}
			</h1>
			{#if !itemState.isNameEditable}
				<button
					class="transform p-2 transition duration-150 active:scale-90 disabled:cursor-not-allowed disabled:text-neutral-500 disabled:active:scale-100"
					onclick={setFocusOnHeaderElement}
					disabled={pageState === 'renaming' || wishlistData.current?.wishlist.isLocked}
				>
					<SquarePen />
				</button>
			{:else}
				<button
					class="transform rounded-md border bg-white p-2 text-red-500 shadow-sm transition duration-150 active:scale-90"
					onclick={revertNameChange}
				>
					<X size="20" />
				</button>

				<button
					class=" transform rounded-md border bg-white p-2 text-green-500 shadow-sm transition duration-150 active:scale-90"
					onclick={renameWishlist}
				>
					<Check size="20" />
				</button>
			{/if}
		</div>
		<h2 class="mb-1 text-lg font-semibold text-neutral-600">Shipping Address</h2>

		<AddressAutofill
			bind:formElement={addressFormElement}
			onAddressSelect={saveWishlistAddress}
			disabled={wishlistData.current.wishlist.isLocked}
			streetPlaceholder={wishlistData.current.wishlist.streetAddress}
			apartmentPlaceholder={wishlistData.current.wishlist.streetAddress2}
			cityPlaceholder={wishlistData.current.wishlist.city}
			statePlaceholder={wishlistData.current.wishlist.state}
			zipPlaceholder={wishlistData.current.wishlist.zipCode}
		/>

		{#if wishlistData.current.items.length === 0}
			<p class="italic text-neutral-500">No items added yet</p>
		{:else}
			<ul class="flex w-full flex-col gap-3.5">
				{#each wishlistData.current.items as wishlistItem (wishlistItem.id)}
					<li in:slide out:scale>
						<WishlistItemCard
							item={wishlistItem}
							isLocked={wishlistData.current.wishlist.isLocked}
							onEditItem={() => {
								initializeEditForm(wishlistItem);
								itemState.openEditModal();
							}}
							onDeleteItem={handleItemDelete}
						/>
					</li>
				{/each}
			</ul>
		{/if}

		<button
			aria-label="open new item modal"
			class="mt-4 flex transform select-none items-center justify-center gap-1 rounded-md bg-black px-6 py-1 text-neutral-100 transition duration-150 active:scale-90 disabled:cursor-not-allowed disabled:border-neutral-400 disabled:bg-neutral-500 disabled:active:scale-100"
			onclick={() => {
				itemState.openAddModal();
				createItemForm.fields.itemQuantity.set(1);
			}}
			disabled={wishlistData.current.wishlist.isLocked}
		>
			<Plus size={16} />
			<p>Add an item</p>
		</button>
	</main>
{/if}

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
			<button
				class="transform select-none rounded-md border-2 border-red-500 bg-red-100 px-4 py-2 text-red-500 shadow-lg transition duration-150 active:scale-90"
				disabled={pageState === 'deleting'}
				onclick={deleteWishlistItem}
			>
				Delete
			</button>
		</div>
	</div>
</Modal>

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
		{#if itemState.mode === 'add'}
			<NewItemForm
				id={page.params.id ?? ''}
				idlePageState={() => (pageState = 'idle')}
				createPageState={() => (pageState = 'creating')}
				closeModal={() => itemState.closeModal('NEW')}
			/>
		{:else}
			<EditItemForm
				idlePageState={() => (pageState = 'idle')}
				updatePageState={() => (pageState = 'updating')}
				closeModal={() => itemState.closeModal('NEW')}
			/>
		{/if}
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

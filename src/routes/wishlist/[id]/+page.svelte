<script lang="ts">
	import { Check, Pencil, Plus, Trash2, TriangleAlert, X } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import Modal from '$lib/components/modal.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { twJoin } from 'tailwind-merge';
	import NumberStepper from '$lib/components/number-stepper.svelte';
	import { type WishlistItem } from '$lib/server/db/schema';
	import { fade, slide } from 'svelte/transition';
	import { tick } from 'svelte';
	import toast from 'svelte-french-toast';
	import { WishlistItemStateClass } from './item-state.svelte';
	import { ValidationStateClass } from './validation-state.svelte';
	import ErrorMessage from '$lib/components/error-message.svelte';

	let { data }: PageProps = $props();

	const itemState = new WishlistItemStateClass();
	const validationState = new ValidationStateClass();
	const visibleItems = $derived(data.items.filter((item) => !item.isDeleted));
	const disabled = $derived(validationState.disabled);

	const submitNewItem: SubmitFunction = ({ formData }) => {
		formData.append('wishlistId', data.wishlist.id);
		formData.append('itemQuantity', `${itemState.quantity}`);

		return async ({ update, result }) => {
			if (result.type === 'failure') {
				const errorDetails = result.data;
				if (errorDetails) {
					validationState.updateErrors(errorDetails);
				}
				await update({ reset: false, invalidateAll: false });
			} else {
				itemState.closeModal('NEW');
				itemState.reset();
				validationState.reset();
				await update();
			}
		};
	};

	const submitDeleteWishlistItem: SubmitFunction = ({ formData }) => {
		if (itemState.itemToDelete) {
			formData.append('itemId', itemState.itemToDelete.id);
		}
		formData.append('wishlistId', data.wishlist.id);

		return async ({ update }) => {
			itemState.closeModal('DELETE');
			await update({ reset: true, invalidateAll: true });
		};
	};

	const submitNameChange: SubmitFunction = ({ formData }) => {
		formData.append('newName', itemState.newName);
		formData.append('oldName', data.wishlist.name);
		formData.append('wishlistId', data.wishlist.id);

		return async ({ update, result }) => {
			if (result.type === 'failure') {
				if (itemState.wishlistNameElement) {
					itemState.wishlistNameElement.innerText = data.wishlist.name;
				}
				const failureData = result.data;
				if (failureData) {
					const errorCause: string | undefined = failureData['errorCause'];
					if (errorCause) {
						toast.error(errorCause);
					}
				}
			}
			itemState.isNameEditable = false;
			await update({ reset: true, invalidateAll: true });
		};
	};

	const handleItemDelete = (selectedItem: WishlistItem) => {
		itemState.itemToDelete = selectedItem;
		itemState.isDeleteItemModalOpen = true;
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

		if (itemState.wishlistNameElement) {
			itemState.wishlistNameElement.innerText = data.wishlist.name;
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
			<button class="rounded-md p-3 hover:bg-amber-500/20"> <Pencil color="#F59E0B" /> </button>
			<button
				class="rounded-md p-3 hover:bg-red-500/20"
				onclick={() => handleItemDelete(wishlistItem)}
			>
				<Trash2 color="#EF4444" />
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
			<button class="rounded-md p-2 hover:bg-amber-500/20">
				<Pencil color="#F59E0B" size="20" />
			</button>
			<button
				class="rounded-md p-2 hover:bg-red-500/20"
				onclick={() => handleItemDelete(wishlistItem)}
			>
				<Trash2 color="#EF4444" size="20" />
			</button>
		</span>
	</div>
{/snippet}

<main class="w-full p-4">
	<div class="mb-4 flex items-center gap-4">
		<h1
			bind:this={itemState.wishlistNameElement}
			class="py-2 text-xl font-bold focus:bg-white"
			oninput={handleInput}
			contenteditable={itemState.isNameEditable}
			dir="ltr"
		>
			{data.wishlist.name}
		</h1>
		{#if !itemState.isNameEditable}
			<button class="p-2" onclick={handleEditName}><Pencil size="20" /></button>
		{:else}
			<button
				class="rounded-md border bg-white p-2 text-red-500 shadow-sm"
				onclick={revertWishlistName}><X size="20" /></button
			>
			<form method="POST" action="?/updateWishlistName" use:enhance={submitNameChange}>
				<button class=" rounded-md border bg-white p-2 text-green-500 shadow-sm"
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

	{#if visibleItems.length === 0}
		<p class="italic text-neutral-500">No items added yet</p>
	{:else}
		<ul class="flex w-full flex-col gap-3.5">
			{#each visibleItems as wishlistItem (wishlistItem.id)}
				<li in:slide out:fade>
					{@render itemComponent(wishlistItem)}
				</li>
			{/each}
		</ul>
	{/if}

	<button
		aria-label="open new item modal"
		class="mt-4 flex transform select-none items-center justify-center gap-1 rounded-md bg-black px-6 py-1 text-neutral-100 transition duration-100 active:scale-90"
		onclick={() => (itemState.isNewItemModalOpen = true)}
	>
		<Plus size={16} />
		<p>Add an item</p>
	</button>

	<Modal
		id="new-item-modal"
		bind:this={itemState.newItemModal}
		isOpen={itemState.isNewItemModalOpen}
		onModalClose={() => itemState.updateModalState(!itemState.isNewItemModalOpen, 'NEW')}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
	>
		<div class="flex w-full flex-col gap-1">
			<button
				class="flex size-9 transform items-center justify-center self-end rounded-full bg-stone-200 shadow-md transition duration-100 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-90"
				type="button"
				aria-label="close new item modal"
				onclick={() => itemState.closeModal('NEW')}
			>
				&times;
			</button>
			<form class="flex flex-col gap-2" method="POST" use:enhance={submitNewItem}>
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
						class="transform cursor-pointer select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
						onclick={() => itemState.closeModal('NEW')}
					>
						Cancel
					</button>
					<button
						formaction="?/createWishlistItem"
						aria-label="create new item"
						class="transform select-none rounded-md border-2 border-green-500 bg-green-100 px-4 py-2 text-green-500 shadow-lg transition duration-100 active:scale-90 disabled:cursor-not-allowed disabled:border-neutral-500 disabled:bg-neutral-300 disabled:text-neutral-500"
						{disabled}
					>
						Add to Wishlist
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
				class="flex size-9 transform select-none items-center justify-center self-end rounded-full bg-stone-200 shadow-md transition duration-100 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-90"
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
					class="transform select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
					onclick={() => itemState.closeModal('DELETE')}>Cancel</button
				>
				<form method="POST" action="?/deleteWishlistItem" use:enhance={submitDeleteWishlistItem}>
					<button
						class="transform select-none rounded-md border-2 border-red-500 bg-red-100 px-4 py-2 text-red-500 shadow-lg transition duration-100 active:scale-90"
					>
						Delete
					</button>
				</form>
			</div>
		</div>
	</Modal>
</main>

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

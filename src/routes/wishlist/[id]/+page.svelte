<script lang="ts">
	import { Check, Pencil, Plus, Trash2, TriangleAlert, X } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import Modal from '$lib/components/modal.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { newItemSchema } from '$lib/schema';
	import { twJoin } from 'tailwind-merge';
	import NumberStepper from '$lib/components/number-stepper.svelte';
	import { type WishlistItem } from '$lib/server/db/schema';
	import { fade, slide } from 'svelte/transition';
	import { tick } from 'svelte';

	let { data }: PageProps = $props();

	let newWishlistName: string = $state('');
	let isNameEditable: boolean = $state(false);
	let isModalOpen: boolean = $state(false);
	let isDeleteItemModalOpen: boolean = $state(false);
	let itemToDelete: WishlistItem | undefined = $state();
	let newItemModal: Modal | undefined = $state();
	let deleteItemModal: Modal | undefined = $state();
	let wishlistName: HTMLHeadingElement | undefined = $state();
	let {
		itemName,
		itemUrl,
		itemQuantity,
		itemCost
	}: {
		itemName: string;
		itemUrl: string;
		itemQuantity: number;
		itemCost: number | undefined;
	} = $state({
		itemName: '',
		itemUrl: '',
		itemQuantity: 1,
		itemCost: undefined
	});
	let {
		nameError,
		urlError,
		quantityError,
		costError
	}: {
		nameError: string | undefined;
		urlError: string | undefined;
		quantityError: string | undefined;
		costError: string | undefined;
	} = $state({
		nameError: undefined,
		urlError: undefined,
		quantityError: '',
		costError: undefined
	});

	const visibleItems = $derived(data.items.filter((item) => !item.isDeleted));
	const disabled: boolean = $derived.by(() => {
		const hasNameError: boolean = nameError === undefined || nameError !== '';
		const hasUrlError: boolean = urlError === undefined || urlError !== '';
		const hasCountError: boolean = quantityError === undefined || quantityError !== '';
		const hasPriceError: boolean = costError === undefined || costError !== '';

		return hasNameError || hasUrlError || hasCountError || hasPriceError;
	});

	const submitNewItem: SubmitFunction = () => {
		return async ({ update, result }) => {
			if (result.type === 'failure') {
				const errorDetails = result.data;
				console.log(errorDetails);
				if (errorDetails) {
					if (errorDetails['itemCost']) {
						costError = errorDetails['itemCost'][0];
					}
					if (errorDetails['itemName']) {
						nameError = errorDetails['itemName'][0];
					}
					if (errorDetails['itemUrl']) {
						urlError = errorDetails['itemUrl'][0];
					}
					if (errorDetails['itemQuantity']) {
						quantityError = errorDetails['itemQuantity'][0];
					}
				}
				await update({ reset: false, invalidateAll: false });
			} else {
				newItemModal?.close();
				resetInputs();
				await update();
			}
		};
	};

	const submitDeleteWishlistItem: SubmitFunction = () => {
		return async ({ update }) => {
			deleteItemModal?.close();
			await update({ reset: true, invalidateAll: true });
		};
	};

	const submitNameChange: SubmitFunction = () => {
		return async ({ update }) => {
			isNameEditable = false;
			await update({ reset: true, invalidateAll: true });
		};
	};

	const resetInputs = () => {
		itemName = '';
		itemUrl = '';
		itemQuantity = 1;
		itemCost = undefined;
		nameError = undefined;
		urlError = undefined;
		quantityError = '';
		costError = undefined;
	};

	const validateItemName = () => {
		const itemNameSchema = newItemSchema.shape.itemName;
		const result = itemNameSchema.safeParse(itemName);
		if (!result.success) {
			const error = result.error.flatten().formErrors[0];
			nameError = error;
		} else {
			nameError = '';
		}
	};

	const validateItemUrl = () => {
		const itemUrlSchema = newItemSchema.shape.itemUrl;
		const result = itemUrlSchema.safeParse(itemUrl);
		if (!result.success) {
			const error = result.error.flatten().formErrors[0];
			urlError = error;
		} else {
			urlError = '';
		}
	};

	const validateItemCost = () => {
		const itemCostSchema = newItemSchema.shape.itemCost;
		const result = itemCostSchema.safeParse(itemCost);
		if (!result.success) {
			const error = result.error.flatten().formErrors[0];
			costError = error;
		} else {
			costError = '';
		}
	};

	const handleItemDelete = (selectedItem: WishlistItem) => {
		itemToDelete = selectedItem;
		isDeleteItemModalOpen = true;
	};

	const handelEditName = async () => {
		isNameEditable = true;
		await tick();
		wishlistName?.focus();
	};

	const handleInput = () => {
		const currentWishlistName = wishlistName?.innerText.trim();
		if (currentWishlistName) {
			newWishlistName = currentWishlistName;
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
			bind:this={wishlistName}
			class="py-2 text-xl font-bold focus:bg-white"
			oninput={handleInput}
			contenteditable={isNameEditable}
		>
			{data.wishlist.name}
		</h1>
		{#if !isNameEditable}
			<button class="p-2" onclick={handelEditName}><Pencil size="20" /></button>
		{:else}
			<button
				class="rounded-md border bg-white p-2 text-red-500 shadow-sm"
				onclick={() => (isNameEditable = false)}><X size="20" /></button
			>
			<form method="POST" action="?/updateWishlistName" use:enhance={submitNameChange}>
				<button class=" rounded-md border bg-white p-2 text-green-500 shadow-sm"
					><Check size="20" /></button
				>
				<input hidden type="hidden" name="newName" value={newWishlistName} />
				<input hidden type="hidden" name="oldName" value={data.wishlist.name} />
				<input hidden type="hidden" name="wishlistId" value={data.wishlist.id} />
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
		onclick={() => (isModalOpen = true)}
	>
		<Plus size={16} />
		<p>Add an item</p>
	</button>

	<Modal
		id="new-item-modal"
		bind:this={newItemModal}
		isOpen={isModalOpen}
		onModalClose={() => (isModalOpen = !isModalOpen)}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
	>
		<div class="flex w-full flex-col gap-1">
			<button
				class="flex size-9 transform items-center justify-center self-end rounded-full bg-stone-200 shadow-md transition duration-100 active:scale-90"
				type="button"
				aria-label="close new item modal"
				onclick={() => newItemModal?.close()}
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
							nameError && 'border-red-500'
						)}
						onchange={validateItemName}
						bind:value={itemName}
					/>
					<span class="h-4 text-sm italic text-red-500">{nameError}</span>
				</span>

				<span class="flex flex-col items-start justify-center gap-1">
					<input
						type="text"
						name="itemUrl"
						placeholder="Url..."
						class={twJoin(
							'w-3/4 rounded-md border p-1 focus:outline-none',
							urlError && 'border-red-500'
						)}
						onchange={validateItemUrl}
						bind:value={itemUrl}
					/>
					<p class="h-4 text-sm italic text-red-500">{urlError}</p>
				</span>

				<span class="flex flex-col items-start justify-center gap-1">
					<NumberStepper bind:value={itemQuantity} />
					<p class="h-4 text-sm italic text-red-500">{quantityError}</p>
					<input hidden type="hidden" class="hidden" name="itemQuantity" value={itemQuantity} />
				</span>

				<span class="flex flex-col items-start justify-center gap-1">
					<span class="flex items-center gap-1 text-2xl">
						<label for="itemCost" class="select-none">$</label>
						<input
							type="number"
							inputmode="decimal"
							placeholder="00.00"
							class={twJoin('w-fit border-none focus:outline-none', costError && 'border-red-500')}
							id="itemCost"
							name="itemCost"
							onchange={validateItemCost}
							bind:value={itemCost}
						/>
					</span>
					<p class="h-4 text-sm italic text-red-500">{costError}</p>
				</span>
				<span class="mt-1 flex gap-2 self-center">
					<button
						type="button"
						aria-label="close new item modal"
						class="transform cursor-pointer select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
						onclick={() => newItemModal?.close()}>Cancel</button
					>
					<button
						formaction="?/createWishlistItem"
						aria-label="create new item"
						class="transform select-none rounded-md border-2 border-green-500 bg-green-100 px-4 py-2 text-green-500 shadow-lg transition duration-100 active:scale-90 disabled:cursor-not-allowed disabled:border-neutral-500 disabled:bg-neutral-300 disabled:text-neutral-500"
						{disabled}
					>
						Add to Wishlist
					</button>
				</span>

				<input hidden type="hidden" class="hidden" name="wishlistId" value={data.wishlist.id} />
			</form>
		</div>
	</Modal>

	<Modal
		id="delete-item-modal"
		onModalClose={() => (isDeleteItemModalOpen = !isDeleteItemModalOpen)}
		isOpen={isDeleteItemModalOpen}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
		bind:this={deleteItemModal}
	>
		<div class="flex flex-col items-center gap-3">
			<button
				class="flex size-9 transform select-none items-center justify-center self-end rounded-full bg-stone-200 shadow-md transition duration-100 active:scale-90"
				onclick={() => deleteItemModal?.close()}
			>
				&times;
			</button>
			<span class="rounded-md bg-red-100 p-3 text-red-500">
				<TriangleAlert />
			</span>
			<span class="flex flex-col items-center justify-center gap-1">
				<p class="text-2xl font-bold">Are you sure?</p>
				<p class="text-md text-center text-neutral-500">
					Are you sure you want to delete <span class="font-bold">{itemToDelete?.itemName}</span>?
					This action cannot be undone.
				</p>
			</span>
			<div class="flex items-center justify-center gap-2">
				<button
					class="transform select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
					onclick={() => deleteItemModal?.close()}>Cancel</button
				>
				<form method="POST" action="?/deleteWishlistItem" use:enhance={submitDeleteWishlistItem}>
					<button
						class="transform select-none rounded-md border-2 border-red-500 bg-red-100 px-4 py-2 text-red-500 shadow-lg transition duration-100 active:scale-90"
						>Delete</button
					>
					<input hidden type="hidden" class="hidden" name="itemId" value={itemToDelete?.id} />
					<input hidden type="hidden" class="hidden" name="wishlistId" value={data.wishlist.id} />
				</form>
			</div>
		</div>
	</Modal>
</main>

<style>
	input[type='number']::-webkit-outer-spin-button,
	input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>

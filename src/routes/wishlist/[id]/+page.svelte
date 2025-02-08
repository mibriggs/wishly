<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import type { PageData } from './$types';
	import Modal from '$lib/components/modal.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { newItemSchema } from '$lib/schema';
	import { twJoin } from 'tailwind-merge';

	let { data }: { data: PageData } = $props();
	let isModalOpen: boolean = $state(false);
	let modal: Modal;

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
				modal.close();
				await update();
			}
		};
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

	const validateItemQuantity = () => {
		const itemQuantitySchema = newItemSchema.shape.itemQuantity;
		const result = itemQuantitySchema.safeParse(itemQuantity);
		if (!result.success) {
			const error = result.error.flatten().formErrors[0];
			quantityError = error;
		} else {
			quantityError = '';
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
</script>

<main class="w-full p-4">
	<p class=" text-lg font-bold">{data.wishlist.name}</p>
	{#if data.items.length === 0}
		<p class="italic text-neutral-500">No items added yet</p>
	{:else}
		{#each data.items as wishlistItem (wishlistItem.id)}
			<p>{wishlistItem.itemName}</p>
		{/each}
	{/if}
	<button
		aria-label="open new item modal"
		class="mt-4 flex select-none items-center justify-center gap-1 rounded-md bg-black px-4 py-1 text-neutral-100"
		onclick={() => (isModalOpen = true)}
	>
		<Plus size={16} />
		<p>Add an item</p>
	</button>

	<Modal
		id="new-item-modal"
		bind:this={modal}
		isOpen={isModalOpen}
		onModalClose={() => (isModalOpen = !isModalOpen)}
		class="w-11/12 max-w-[560px] rounded-lg p-4 shadow-sm backdrop:bg-stone-400 backdrop:bg-opacity-5 md:w-2/3 lg:w-1/2"
	>
		<div class="flex w-full flex-col gap-1">
			<button
				class="flex size-9 items-center justify-center self-end rounded-full bg-stone-200"
				type="button"
				aria-label="close new item modal"
				onclick={() => modal.close()}
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
					<input
						type="number"
						name="itemQuantity"
						min="1"
						placeholder="Quantity"
						class={twJoin(
							'w-1/4 rounded-md border p-1 focus:outline-none',
							quantityError && 'border-red-500'
						)}
						onchange={validateItemQuantity}
						bind:value={itemQuantity}
					/>
					<p class="h-4 text-sm italic text-red-500">{quantityError}</p>
				</span>

				<span class="flex flex-col items-start justify-center gap-1">
					<span class="flex items-center gap-1 text-2xl">
						<label for="itemCost" class="select-none">$</label>
						<input
							type="text"
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
						class="select-none rounded-md border-2 border-black px-4 py-2"
						onclick={() => modal.close()}>Cancel</button
					>
					<button
						formaction="?/createNewItem"
						aria-label="create new item"
						class="select-none rounded-md border-2 border-green-500 bg-green-100 px-4 py-2 text-green-500 disabled:border-neutral-500 disabled:bg-neutral-300 disabled:text-neutral-500"
						{disabled}
					>
						Add to Wishlist
					</button>
				</span>
			</form>
		</div>
	</Modal>
</main>

<script lang="ts">
	import { Pencil, Plus, Trash2 } from 'lucide-svelte';
	import type { PageData } from './$types';
	import Modal from '$lib/components/modal.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { newItemSchema } from '$lib/schema';
	import { twJoin } from 'tailwind-merge';
	import NumberStepper from '$lib/components/number-stepper.svelte';
	import { type WishlistItem } from '$lib/server/db/schema';

	let { data }: { data: PageData } = $props();

	let isModalOpen: boolean = $state(false);
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

	let modal: Modal;

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

	// const validateItemQuantity = () => {
	// 	const itemQuantitySchema = newItemSchema.shape.itemQuantity;
	// 	const result = itemQuantitySchema.safeParse(itemQuantity);
	// 	if (!result.success) {
	// 		const error = result.error.flatten().formErrors[0];
	// 		quantityError = error;
	// 	} else {
	// 		quantityError = '';
	// 	}
	// };

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

{#snippet itemComponent(wishlistItem: WishlistItem)}
	<div
		class="flex w-11/12 items-center justify-start gap-4 rounded-md border border-black bg-neutral-100 px-8 py-3 shadow-md md:w-1/3"
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
			<button class="rounded-md p-3 hover:bg-amber-200"> <Pencil color="#F59E0B" /> </button>
			<button class="rounded-md p-3 hover:bg-red-200"> <Trash2 color="#EF4444" /> </button>
		</span>
	</div>
{/snippet}

<main class="w-full p-4">
	<p class=" mb-2 text-lg font-bold">{data.wishlist.name}</p>
	{#if data.items.length === 0}
		<p class="italic text-neutral-500">No items added yet</p>
	{:else}
		<ul class="flex w-full flex-col gap-2">
			{#each data.items as wishlistItem (wishlistItem.id)}
				<li>
					{@render itemComponent(wishlistItem)}
				</li>
			{/each}
		</ul>
	{/if}
	<button
		aria-label="open new item modal"
		class="mt-4 flex transform select-none items-center justify-center gap-1 rounded-md bg-black px-4 py-1 text-neutral-100 transition duration-100 active:scale-90"
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
				class="flex size-9 transform items-center justify-center self-end rounded-full bg-stone-200 shadow-md transition duration-100 active:scale-90"
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
					<NumberStepper bind:value={itemQuantity} />
					<p class="h-4 text-sm italic text-red-500">{quantityError}</p>
					<input hidden type="hidden" class="hidden" name="itemQuantity" value={itemQuantity} />
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
						class="transform cursor-pointer select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-100 active:scale-90"
						onclick={() => modal.close()}>Cancel</button
					>
					<button
						formaction="?/createNewItem"
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
</main>

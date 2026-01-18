<script lang="ts">
	import { newItemSchema, type CreateNewItemFields } from '$lib/schema';
	import toast from 'svelte-french-toast';
	import { createItemForm } from '../../routes/wishlist/[id]/new-item.remote';
	import ErrorMessage from './error-message.svelte';
	import ItemCost from './item-cost.svelte';
	import ItemName from './item-name.svelte';
	import ItemUrl from './item-url.svelte';
	import NumberStepper from './number-stepper.svelte';
	import type { WishlistItem } from '$lib/server/db/schema';
	import { getErrorMessage, shortIdToUuid } from '$lib';
	import { getWishlistQuery } from '../../routes/wishlist/[id]/get-wishlist.remote';

	interface Props {
		createPageState: () => void;
		idlePageState: () => void;
		closeModal: () => void;
		id: string;
	}

	let { createPageState, idlePageState, closeModal, id }: Props = $props();

	const allCreateInputsEmpty = $derived(
		!createItemForm.fields.itemCost.value() ||
			!createItemForm.fields.itemUrl.value() ||
			!createItemForm.fields.itemName.value() ||
			createItemForm.fields.itemQuantity.value() === undefined ||
			createItemForm.fields.itemQuantity.value() === null
	);

	const disabled = $derived(!!createItemForm.fields.allIssues()?.length || allCreateInputsEmpty);

	const createWishlistItem = async ({ form, submit, data }: CreateNewItemFields) => {
		createPageState();
		const creatingId = toast.loading('Creating new item...');

		try {
			const now = new Date();
			const optimisticItem: WishlistItem = {
				id: crypto.randomUUID(),
				createdAt: now,
				isDeleted: false,
				deletedAt: null,
				updatedAt: now,
				wishlistId: shortIdToUuid(id),
				itemName: data.itemName,
				price: data.itemCost.toString(),
				quantity: data.itemQuantity ?? 1,
				url: data.itemUrl,
				imageUrl: null
			};
			await submit().updates(
				getWishlistQuery().withOverride((curr) => ({
					...curr,
					items: [...curr.items, optimisticItem]
				}))
			);
			form.reset();
			closeModal();
			toast.success('Item added!', { id: creatingId });
		} catch (e: unknown) {
			const errorMessage = getErrorMessage(e);
			toast.error(errorMessage, { id: creatingId });
			console.error(errorMessage);
		} finally {
			idlePageState();
		}
	};
</script>

<form
	class="flex flex-col gap-2"
	oninput={() => createItemForm.validate()}
	{...createItemForm
		.preflight(newItemSchema.omit({ wishlistId: true }))
		.enhance(createWishlistItem)}
>
	<span class="flex flex-col items-start justify-center gap-1">
		<ItemName
			issues={createItemForm.fields.itemName.issues()}
			formProps={createItemForm.fields.itemName.as('text')}
		/>
		{#each createItemForm.fields.itemName.issues() as issue}
			<ErrorMessage message={issue.message} />
		{/each}
	</span>

	<span class="flex flex-col items-start justify-center gap-1">
		<ItemUrl
			issues={createItemForm.fields.itemUrl.issues()}
			formProps={createItemForm.fields.itemUrl.as('text')}
		/>
		{#each createItemForm.fields.itemUrl.issues() as issue}
			<ErrorMessage message={issue.message} />
		{/each}
	</span>

	<span class="flex flex-col items-start justify-center gap-1">
		<NumberStepper {...createItemForm.fields.itemQuantity.as('number')} />
		{#each createItemForm.fields.itemQuantity.issues() as issue}
			<ErrorMessage message={issue.message} />
		{/each}
	</span>

	<span class="flex flex-col items-start justify-center gap-1">
		<ItemCost
			issues={createItemForm.fields.itemCost.issues()}
			formProps={createItemForm.fields.itemCost.as('text')}
		/>
		{#each createItemForm.fields.itemCost.issues() as issue}
			<ErrorMessage message={issue.message} />
		{/each}
	</span>
	<span class="mt-1 flex gap-2 self-center">
		<button
			type="button"
			aria-label="close new item modal"
			class="transform cursor-pointer select-none rounded-md border-2 border-black px-4 py-2 shadow-lg transition duration-150 active:scale-90"
			onclick={closeModal}
		>
			Cancel
		</button>
		<button
			aria-label="create new item"
			class="transform select-none rounded-md border-2 border-green-500 bg-green-100 px-4 py-2 text-green-500 shadow-lg transition duration-150 active:scale-90 disabled:cursor-not-allowed disabled:border-neutral-500 disabled:bg-neutral-300 disabled:text-neutral-500"
			{disabled}
		>
			Add to Wishlist
		</button>
	</span>
</form>

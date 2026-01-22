<script lang="ts">
	import { updateItemSchema, type EditItemFields } from '$lib/schema';
	import toast from 'svelte-french-toast';
	import ErrorMessage from './error-message.svelte';
	import ItemCost from './item-cost.svelte';
	import ItemName from './item-name.svelte';
	import ItemUrl from './item-url.svelte';
	import NumberStepper from './number-stepper.svelte';
	import { getErrorMessage } from '$lib';
	import { getWishlistQuery } from '../../routes/wishlist/[id]/remote-functions/get-wishlist.remote';
	import { editItemForm } from '../../routes/wishlist/[id]/remote-functions/edit-item.remote';

	interface Props {
		updatePageState: () => void;
		idlePageState: () => void;
		closeModal: () => void;
	}

	let { updatePageState, idlePageState, closeModal }: Props = $props();

	const allEditInputsEmpty = $derived(
		!editItemForm.fields.itemCost.value() ||
			!editItemForm.fields.itemUrl.value() ||
			!editItemForm.fields.itemName.value() ||
			!editItemForm.fields.itemQuantity.value() ||
			!editItemForm.fields.itemId.value()
	);

	const disabled = $derived(!!editItemForm.fields.allIssues()?.length || allEditInputsEmpty);

	const editWishlistItem = async ({ form, submit, data }: EditItemFields) => {
		updatePageState();
		const creatingId = toast.loading('Updating item...');

		try {
			await submit().updates(
				getWishlistQuery().withOverride((curr) => ({
					...curr,
					items: curr.items.map((item) => {
						if (item.id === data.itemId) {
							item.itemName = data.itemName;
							item.url = data.itemUrl;
							item.quantity = data.itemQuantity ?? item.quantity;
							item.price = data.itemCost.toString();
							item.updatedAt = new Date();
						}
						return item;
					})
				}))
			);
			form.reset();
			closeModal();
			toast.success('Item updated!', { id: creatingId });
		} catch (e: unknown) {
			closeModal();

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
	oninput={() => editItemForm.validate()}
	{...editItemForm.preflight(updateItemSchema.omit({ wishlistId: true })).enhance(editWishlistItem)}
>
	<!-- Hidden input for itemId -->
	<input {...editItemForm.fields.itemId.as('hidden', editItemForm.fields.itemId.value())} />

	<span class="flex flex-col items-start justify-center gap-1">
		<ItemName
			issues={editItemForm.fields.itemName.issues()}
			formProps={editItemForm.fields.itemName.as('text')}
		/>
		<div class="min-h-4">
			{#each editItemForm.fields.itemName.issues() as issue}
				<ErrorMessage message={issue.message} />
			{/each}
		</div>
	</span>

	<span class="flex flex-col items-start justify-center gap-1">
		<ItemUrl
			issues={editItemForm.fields.itemUrl.issues()}
			formProps={editItemForm.fields.itemUrl.as('text')}
		/>
		<div class="min-h-4">
			{#each editItemForm.fields.itemUrl.issues() as issue}
				<ErrorMessage message={issue.message} />
			{/each}
		</div>
	</span>

	<span class="flex flex-col items-start justify-center gap-1">
		<NumberStepper {...editItemForm.fields.itemQuantity.as('number')} />
		<div class="min-h-4">
			{#each editItemForm.fields.itemQuantity.issues() as issue}
				<ErrorMessage message={issue.message} />
			{/each}
		</div>
	</span>

	<span class="flex flex-col items-start justify-center gap-1">
		<ItemCost
			issues={editItemForm.fields.itemCost.issues()}
			formProps={editItemForm.fields.itemCost.as('text')}
		/>
		<div class="min-h-4">
			{#each editItemForm.fields.itemCost.issues() as issue}
				<ErrorMessage message={issue.message} />
			{/each}
		</div>
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
			Update Item
		</button>
	</span>
</form>

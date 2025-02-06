<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import type { PageData } from './$types';
	import Modal from '$lib/components/modal.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data }: { data: PageData } = $props();
	let isModalOpen: boolean = $state(false);
	let modal: Modal;

    const submitNewItem: SubmitFunction = () => {
		return async ({ update }) => {
			modal.close();
			await update();
		};
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
				<input type="text" name="itemName" placeholder="Enter product name..." class="w-3/4 rounded-md border p-1 select-none" required />
				<input type="text" name="itemUrl" placeholder="Enter url..." class="w-3/4 rounded-md border p-1" required />
				<input type="number" name="itemQuantity" min="1" placeholder="Quantity" class="w-1/4 rounded-md border p-1" required />
                <span class="flex items-center gap-1 text-2xl">
                    <label for="itemCost">$</label>
                    <input type="text" placeholder="00.00" class="w-fit border-none" id="itemCost" name="itemCost" required />
                </span>
				<span class="mt-1 flex gap-2 self-center">
					<button
                        type="button"
						aria-label="close new item modal"
						class="rounded-md border-2 border-black px-4 py-2"
						onclick={() => modal.close()}>Cancel</button
					>
					<button
                        formaction="?/createNewItem"
						aria-label="create new item"
						class="rounded-md border-2 border-green-500 bg-green-100 px-4 py-2 text-green-500"
						>Add to Wishlist</button
					>
				</span>
			</form>
		</div>
	</Modal>
</main>

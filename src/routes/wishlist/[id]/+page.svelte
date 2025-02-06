<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import type { PageData } from './$types';
	import Modal from '$lib/components/modal.svelte';

	let { data }: { data: PageData } = $props();
	let isModalOpen: boolean = $state(false);
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
		class="mt-4 flex items-center justify-center gap-1 rounded-md bg-black px-4 py-1 text-neutral-100"
		onclick={() => (isModalOpen = true)}
	>
		<Plus size={16} />
		<p>Add an item</p>
	</button>

	<Modal
		id="new-item-modal"
		isOpen={isModalOpen}
		onModalClose={() => (isModalOpen = !isModalOpen)}
		class=""
	/>
</main>

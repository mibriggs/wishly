<script lang="ts">
	import type { WishlistItem } from '$lib/server/db/schema';
	import { SquarePen, Trash2 } from 'lucide-svelte';

	interface Props {
		item: WishlistItem;
		isLocked: boolean;
		onEditItem: (item: WishlistItem) => void;
		onDeleteItem: (item: WishlistItem) => void;
	}

	const { item, isLocked, onEditItem, onDeleteItem }: Props = $props();
</script>

<!-- everywhere else -->
<div
	class="hidden w-11/12 items-center justify-start gap-4 rounded-md border border-black bg-white px-8 py-3 shadow-md sm:flex md:w-3/4 xl:w-1/3"
>
	<p class="rounded-md bg-neutral-300 p-5">📦</p>
	<span class="flex flex-col justify-center">
		<p class=" text-lg font-semibold">{item.itemName}</p>
		<a href={item.url} target="_blank" class=" text-blue-600 underline underline-offset-1"
			>View Product</a
		>
		<p class="text-sm italic text-neutral-500">
			${item.price} per unit • {item.quantity} pcs
		</p>
	</span>
	<span class="ml-auto flex items-center gap-4">
		<button
			class="transform rounded-md p-3 transition duration-150 hover:bg-amber-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
			disabled={isLocked}
			onclick={() => onEditItem(item)}
		>
			<SquarePen color={isLocked ? '#737373' : '#F59E0B'} />
		</button>
		<button
			class="transform rounded-md p-3 transition duration-150 hover:bg-red-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
			disabled={isLocked}
			onclick={() => onDeleteItem(item)}
		>
			<Trash2 color={isLocked ? '#737373' : '#EF4444'} />
		</button>
	</span>
</div>

<!-- phone screens -->
<div
	class="flex w-full items-start justify-between gap-4 rounded-md border border-black bg-white p-3 sm:hidden"
>
	<p class="rounded-md bg-neutral-300 px-4 py-3">📦</p>

	<span>
		<p class=" text-lg font-semibold">{name}</p>
		<a href={item.url} target="_blank" class=" text-blue-600 underline underline-offset-1"
			>View Product</a
		>
		<p class="text-sm italic text-neutral-500">
			${item.price} per unit • {item.quantity} pcs
		</p>
	</span>

	<span class="flex gap-2 self-end">
		<button
			class="transform rounded-md p-2 transition duration-150 hover:bg-amber-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
			disabled={isLocked}
			onclick={() => onEditItem(item)}
		>
			<SquarePen color={isLocked ? '#737373' : '#F59E0B'} size="20" />
		</button>
		<button
			class="transform rounded-md p-2 transition duration-150 hover:bg-red-500/20 active:scale-90 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:active:scale-100"
			disabled={isLocked}
			onclick={() => onDeleteItem(item)}
		>
			<Trash2 color={isLocked ? '#737373' : '#EF4444'} size="20" />
		</button>
	</span>
</div>

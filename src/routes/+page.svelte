<script lang="ts">
	import { Lock, LockOpen, Plus, Share2, Trash2 } from 'lucide-svelte';
	import type { PageData } from './$types';
	import type { Wishlist } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
</script>

{#snippet wishlistComponent(wishlist: Wishlist)}
	<div class="flex h-44 w-[312px] flex-col justify-between rounded-lg bg-white pl-4 shadow-sm">
		<div class="p-1">
			<p class="font-bold">{wishlist.name}</p>
			<p class="italic text-gray-400">{wishlist.isLocked ? 'Locked' : 'Unlocked'}</p>
		</div>

		<div class="flex items-center gap-3 pb-4">
			<a href={`/wishlist/${wishlist.id}`} class="rounded-md border-2 px-2 py-1 shadow-sm">Expand</a
			>
			<form method="POST" class="w-fit" use:enhance>
				<button class="rounded-md border-2 px-2 py-1 shadow-sm" formaction="?/lockWishlist">
					{#if wishlist.isLocked}
						<Lock size="20" />
					{:else}
						<LockOpen size="20" />
					{/if}
				</button>
				<button class="rounded-md border-2 px-2 py-1 shadow-sm" type="button">
					<Share2 size="20" />
				</button>
				<button
					formaction="?/deleteWishlist"
					class="rounded-md border-2 border-red-600 bg-red-500 px-2 py-1 text-white shadow-sm"
				>
					<Trash2 size="20" />
				</button>
				<input class="hidden" name="wishlistId" id="wishlistId" value={wishlist.id} />
                <input class="hidden" name="isLocked" id="isLocked" value={wishlist.isLocked} />
			</form>
		</div>
	</div>
{/snippet}

{#snippet addMore()}
	<div
		class="flex h-44 w-[312px] flex-col justify-center rounded-lg border-2 border-dashed bg-blue-100 shadow-sm group-disabled:bg-neutral-300"
	>
		<div
			class="gap- flex items-center justify-center font-bold text-blue-700 group-disabled:text-neutral-500"
		>
			<Plus size={20} />
			<p>Create New List</p>
		</div>
	</div>
{/snippet}

<!-- <main class="flex flex-wrap items-center justify-center gap-4 px-10 pt-12"> -->
<!-- need like an autosave feature for creating new wishlists, since we manually add items no need to autosave that -->
<main
	class="grid grid-cols-1 items-center justify-center gap-4 p-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
>
	{#await data.wishlists}
		<button class="group w-fit" disabled>
			{@render addMore()}
		</button>
	{:then wishlists}
		{#each wishlists as wishlist (wishlist.id)}
			{@render wishlistComponent(wishlist)}
		{/each}

		<form method="POST" action="?/createWishlist" class="w-fit" use:enhance>
			<button class="group w-fit" disabled={data.isGuestUser && wishlists.length > 0}>
				{@render addMore()}
			</button>
		</form>
	{/await}
</main>

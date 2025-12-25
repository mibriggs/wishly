<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { uuidToShortId, type ShareDuration } from '$lib';
	import { durationSchema, wishlistSchema } from '$lib/schema';
	import { z } from 'zod';
	import type { Wishlist } from '$lib/server/db/schema';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Lock from 'lucide-svelte/icons/lock';
	import LockOpen from 'lucide-svelte/icons/lock-open';
	import Share from 'lucide-svelte/icons/share';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import LoadingSpinner from './loading-spinner.svelte';

	interface Props {
		wishlist: Wishlist;
		loadedWishlists: Wishlist[];
		onDeleteClicked: () => void;
		onShareClicked: (link: string, duration: ShareDuration, shareId: string | null) => void;
		onLock: (id: string, isLocked: boolean, updatedAt: Date) => void;
	}

	const sharedWishlistData = z.object({
		link: z.string(),
		shareId: z.string().nullable(),
		currentDuration: durationSchema
	});

	let { wishlist, loadedWishlists, onDeleteClicked, onShareClicked, onLock }: Props = $props();
	let locking: boolean = $state(false);
	let sharing: boolean = $state(false);

	const submitLockWishlist: SubmitFunction = ({ formData }) => {
		locking = true;
		formData.append('wishlistId', wishlist.id);
		formData.append('isLocked', `${wishlist.isLocked}`);

		return async ({ result, update }) => {
			if (result.type === 'success') {
				const resultData = result.data;
				if (resultData) {
					const updatedWishlist = wishlistSchema.parse(resultData['wishlist']);
					loadedWishlists.forEach((loadedWishlist) => {
						if (loadedWishlist.id === updatedWishlist.id) {
							onLock(loadedWishlist.id, updatedWishlist.isLocked, updatedWishlist.updatedAt);
						}
					});
				}
			}
			await update({ invalidateAll: false });
			locking = false;
		};
	};

	const submitShareWishlist: SubmitFunction = ({ formData }) => {
		formData.append('wishlistId', wishlist.id);
		sharing = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				const maybeData = sharedWishlistData.safeParse(result.data);
				if (maybeData.success) {
					const link = maybeData.data.link;
					const duration = maybeData.data.currentDuration;
					const shareId = maybeData.data.shareId;
					onShareClicked(`${page.url.href}share/${link}`, duration, shareId);
				}
			}
			sharing = false;
			await update({ invalidateAll: false });
		};
	};
</script>

<div class="flex h-44 w-[312px] flex-col justify-between rounded-lg bg-white pl-4 shadow-sm">
	<div class="p-1">
		<p class="font-bold">{wishlist.name}</p>
		<p class="italic text-gray-400">{wishlist.isLocked ? 'Locked' : 'Unlocked'}</p>
	</div>

	<div class="flex items-center gap-3 pb-4">
		<a
			href={`/wishlist/${uuidToShortId(wishlist.id)}`}
			class="transform select-none rounded-md border-2 px-2 py-1 shadow-sm transition duration-100 active:scale-90"
			data-sveltekit-preload-data
		>
			Expand
		</a>
		<form method="POST" class="w-fit" use:enhance={submitLockWishlist}>
			<button
				class="transform select-none rounded-md border-2 px-2 py-1 shadow-sm transition duration-100 active:scale-90"
				formaction="?/lockWishlist"
				disabled={locking}
			>
				{#if locking}
					<LoadingSpinner class="h-5 w-5 fill-blue-500" />
				{:else if wishlist.isLocked}
					<Lock size="20" />
				{:else}
					<LockOpen size="20" />
				{/if}
			</button>
		</form>

		<form method="POST" class="w-fit" use:enhance={submitShareWishlist}>
			<button
				class="transform select-none rounded-md border-2 px-2 py-1 shadow-sm transition duration-100 active:scale-90"
				formaction="?/shareWishlist"
				disabled={sharing}
			>
				{#if sharing}
					<LoadingSpinner class="h-5 w-5 fill-blue-500" />
				{:else}
					<Share size="20" />
				{/if}
			</button>
		</form>

		<button
			class="transform select-none rounded-md border-2 border-red-600 bg-red-500 px-2 py-1 text-white shadow-sm transition duration-100 active:scale-90 active:opacity-85"
			type="button"
			onclick={onDeleteClicked}
		>
			<Trash2 size="20" />
		</button>
	</div>
</div>

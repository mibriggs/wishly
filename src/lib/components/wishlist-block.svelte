<script lang="ts">
	import { page } from '$app/state';
	import { getErrorMessage, uuidToShortId, type ShareDuration } from '$lib';
	import type { Wishlist } from '$lib/server/db/schema';
	import Lock from 'lucide-svelte/icons/lock';
	import LockOpen from 'lucide-svelte/icons/lock-open';
	import Share from 'lucide-svelte/icons/share';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import LoadingSpinner from './loading-spinner.svelte';
	import { shareWishlistCommand, updateLockCommand } from '../../routes/data.remote';
	import toast from 'svelte-french-toast';

	interface Props {
		wishlist: Wishlist;
		onDeleteClicked: () => void;
		onShareClicked: (link: string, duration: ShareDuration, shareId: string | null) => void;
		onLockClicked: (isLocked: boolean, updatedAt: Date) => void;
		onclick?: (id: string) => void;
	}

	let {
		wishlist,
		onDeleteClicked,
		onShareClicked,
		onLockClicked,
		onclick: onClick = undefined
	}: Props = $props();

	let locking: boolean = $state(false);
	let sharing: boolean = $state(false);

	const updateLock = async () => {
		locking = true;
		try {
			// Don't want to refresh the query here so lists don't jump around as they're updated
			await updateLockCommand(wishlist.id);
			onLockClicked(!wishlist.isLocked, new Date());
		} catch (e: unknown) {
			const errorMessage = getErrorMessage(e);
			toast.error(errorMessage);
			console.error(e);
		} finally {
			locking = false;
		}
	};

	const shareWishlist = async () => {
		sharing = true;
		try {
			const data = await shareWishlistCommand(wishlist.id);
			onShareClicked(`${page.url.href}share/${data.link}`, data.currentDuration, data.shareId);
		} catch (e: unknown) {
			console.error(e);
		} finally {
			sharing = false;
		}
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

		<button
			class="transform select-none rounded-md border-2 px-2 py-1 shadow-sm transition duration-100 active:scale-90"
			disabled={locking}
			onclick={() => {
				if (onClick) {
					onClick(wishlist.id);
				}
				updateLock();
			}}
		>
			{#if locking}
				<LoadingSpinner class="h-5 w-5 fill-blue-500" />
			{:else if wishlist.isLocked}
				<Lock size="20" />
			{:else}
				<LockOpen size="20" />
			{/if}
		</button>

		<button
			class="transform select-none rounded-md border-2 px-2 py-1 shadow-sm transition duration-100 active:scale-90"
			formaction="?/shareWishlist"
			disabled={sharing}
			onclick={() => {
				if (onClick) {
					onClick(wishlist.id);
				}
				shareWishlist();
			}}
		>
			{#if sharing}
				<LoadingSpinner class="h-5 w-5 fill-blue-500" />
			{:else}
				<Share size="20" />
			{/if}
		</button>

		<button
			class="transform select-none rounded-md border-2 border-red-600 bg-red-500 px-2 py-1 text-white shadow-sm transition duration-100 active:scale-90 active:opacity-85 disabled:cursor-not-allowed disabled:border-neutral-500 disabled:bg-neutral-400 disabled:active:scale-100 disabled:active:opacity-100"
			type="button"
			onclick={() => {
				if (onClick) {
					onClick(wishlist.id);
				}
				onDeleteClicked();
			}}
			disabled={wishlist.isLocked}
		>
			<Trash2 size="20" />
		</button>
	</div>
</div>

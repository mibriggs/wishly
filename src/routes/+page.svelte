<script lang="ts">
	import { Lock, Plus, Share2, Trash2 } from 'lucide-svelte';

	let lists: number = $state(0);
</script>

{#snippet wishlist()}
	<div class="flex h-44 w-[312px] flex-col justify-between rounded-lg bg-white pl-4 shadow-sm">
		<div class="p-1">
			<p class="font-bold">My Wishlist</p>
			<p class="italic text-gray-400">Unlocked</p>
		</div>

		<div class="flex items-center gap-3 pb-4">
			<a href={`/checklist/${crypto.randomUUID()}`} class="rounded-md border-2 px-2 py-1 shadow-sm">Expand</a>
			<button class="rounded-md border-2 px-2 py-1 shadow-sm">
				<Lock size="20" />
			</button>
			<button class="rounded-md border-2 px-2 py-1 shadow-sm">
				<Share2 size="20" />
			</button>
            <button class="rounded-md border-2 px-2 py-1 shadow-sm bg-red-500 text-white border-red-600">
                <Trash2 size="20" />
            </button>
		</div>
	</div>
{/snippet}

{#snippet addMore()}
	<div class="flex h-44 w-[312px] flex-col justify-center rounded-lg bg-blue-100 shadow-sm">
		<div class="gap- flex items-center justify-center font-bold text-blue-700">
			<Plus size={20} />
			<p>Create New List</p>
		</div>
	</div>
{/snippet}

<!-- <main class="flex flex-wrap items-center justify-center gap-4 px-10 pt-12"> -->
<main class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-center justify-center p-10">
	{#each Array(lists) as _}
		{@render wishlist()}
	{/each}

	<button onclick={() => lists++} class='w-fit'>
		{@render addMore()}
	</button>
</main>

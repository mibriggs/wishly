<script lang="ts">
	import { FileX, Link } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import Cloud from '$lib/components/cloud.svelte';

	const { data }: PageProps = $props();
</script>

{#snippet itemComponent(itemName: string, itemUrl: string, itemPrice: string, itemQuantity: number)}
	<!-- everywhere else -->
	<div
		class="hidden w-11/12 items-center justify-start gap-4 rounded-md border border-black bg-white px-8 py-3 shadow-md sm:flex md:w-3/4 xl:w-1/3"
	>
		<p class="rounded-md bg-neutral-300 p-5">📦</p>
		<span class="flex flex-col justify-center">
			<p class=" text-lg font-semibold">{itemName}</p>
			<a href={itemUrl} target="_blank" class=" text-blue-600 underline underline-offset-1"
				>View Product</a
			>
			<p class="text-sm italic text-neutral-500">
				${itemPrice} per unit • {itemQuantity} pcs
			</p>
		</span>
	</div>

	<!-- phone screens -->
	<div
		class="flex w-full items-start justify-start gap-4 rounded-md border border-black bg-white p-3 sm:hidden"
	>
		<p class="rounded-md bg-neutral-300 px-4 py-3">📦</p>

		<span>
			<p class=" text-lg font-semibold">{itemName}</p>
			<a href={itemUrl} target="_blank" class=" text-blue-600 underline underline-offset-1"
				>View Product</a
			>
			<p class="text-sm italic text-neutral-500">
				${itemPrice} per unit • {itemQuantity} pcs
			</p>
		</span>
	</div>
{/snippet}

{#if data.empty}
	<main class="min-h-screen justify-center pt-32">
		<div class="relative">
			<div class="absolute -bottom-6 left-8 right-8 h-8 rounded-full bg-slate-300/40 blur-xl"></div>

			<section
				class="relative mx-auto w-[min(680px,92vw)] rounded-2xl bg-white p-12 shadow-sm ring-1 ring-black/5"
			>
				<div class="relative mx-auto mb-8 h-36 w-56">
					<Cloud />
					<FileX size="44" color="#ef4444" class="absolute inset-0 m-auto" />
				</div>

				<div class="text-center">
					<h2 class="text-lg font-semibold text-slate-800">No results found</h2>
					<p class="mt-1 text-slate-500">This list has no items.</p>
				</div>
			</section>
		</div>
	</main>
{:else if data.expired}
	<main class="min-h-screen justify-center pt-32">
		<div class="relative">
			<div class="absolute -bottom-6 left-8 right-8 h-8 rounded-full bg-slate-300/40 blur-xl"></div>

			<section
				class="relative mx-auto w-[min(680px,92vw)] rounded-2xl bg-white p-12 shadow-sm ring-1 ring-black/5"
			>
				<div class="relative mx-auto mb-8 h-36 w-56">
					<Cloud />
					<Link size="44" color="#ef4444" class="absolute inset-0 m-auto" />
				</div>

				<div class="text-center">
					<h2 class="text-lg font-semibold text-slate-800">Link Expired</h2>
					<p class="mt-1 text-slate-500">
						This link is no longer valid. Please request a new one from the owner.
					</p>
				</div>
			</section>
		</div>
	</main>
{:else if data.items && data.wishlistName}
	<main class="w-full p-4">
		<div class="mb-4 flex items-center gap-4">
			<h1 class="py-2 text-xl font-bold focus:bg-white" dir="ltr">
				{data.wishlistName}
			</h1>
		</div>

		{#if data.items.length === 0}
			<p class="italic text-neutral-500">No items added yet</p>
		{:else}
			<ul class="flex w-full flex-col gap-3.5">
				{#each data.items as item}
					<li>
						{@render itemComponent(item.itemName, item.itemUrl, item.price, item.quantity)}
					</li>
				{/each}
			</ul>
		{/if}
	</main>
{/if}

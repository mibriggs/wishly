<script>
	import ImageIcon from './image-icon.svelte';
</script>

<div role="status" class="animate-pulse px-4 pt-8">
	<div class="mb-4 flex items-center gap-4">
		<span class="h-6 w-2/12 rounded-md bg-zinc-400 opacity-70"></span>
		<ImageIcon class="h-6 w-6" />
	</div>

	<div class="mb-1 h-6 w-1/5 rounded-md bg-zinc-400 opacity-70"></div>

	<div class="mb-4 flex w-full flex-col gap-3">
		<span class="h-10 w-full rounded-md border-2 bg-zinc-400 p-2 opacity-70 md:w-3/4 lg:w-1/2"
		></span>
		<div class="flex items-center gap-4">
			<span class="h-10 w-[96px] rounded-md border-2 bg-zinc-400 p-2 opacity-70"></span>
			<span class="h-10 w-1/3 rounded-md border-2 bg-zinc-400 p-2 opacity-70"></span>
			<span class="h-10 w-[96px] rounded-md border-2 bg-zinc-400 p-2 opacity-70"></span>
		</div>
	</div>

	<ul class="flex w-full flex-col gap-3.5">
		{#each Array.from({ length: 5 }) as _}
			<li>
				{@render skeletonItemComponent()}
			</li>
		{/each}
		<span
			class="mt-4 flex h-6 w-1/3 items-center justify-center gap-1 rounded-md bg-zinc-400 px-6 py-1 md:w-1/5 lg:w-1/12"
		>
		</span>
	</ul>
</div>

{#snippet skeletonItemComponent()}
	<!-- everywhere else -->
	<div
		class="hidden h-24 w-11/12 items-center justify-start gap-4 rounded-md bg-zinc-400 px-8 py-3 opacity-70 sm:flex md:w-3/4 xl:w-1/3"
	>
		<ImageIcon class="h-6 w-6" />
		<span class="ml-auto flex items-center gap-4">
			<ImageIcon class="h-6 w-6" />
			<ImageIcon class="h-6 w-6" />
		</span>
	</div>

	<!-- phone screens -->
	<div
		class="flex h-24 w-full items-start justify-between gap-4 rounded-md border bg-zinc-400 p-3 opacity-70 sm:hidden"
	>
		<ImageIcon class="h-5 w-5" />

		<div class="flex gap-2 self-end">
			<ImageIcon class="h-5 w-5" />
			<ImageIcon class="h-5 w-5" />
		</div>
	</div>
{/snippet}

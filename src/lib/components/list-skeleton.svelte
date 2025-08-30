{#snippet cardSkeleton()}
	<div
		class="flex h-44 w-[312px] flex-col justify-between rounded-lg border-2 border-solid bg-zinc-400 shadow-sm group-disabled:border-neutral-500 group-disabled:bg-neutral-300"
	>
		<div class="px-4 py-2">
			<div class="mb-2 h-6 w-2/12 rounded-sm bg-zinc-300"></div>
			<div class="h-6 w-2/6 rounded-sm bg-zinc-300"></div>
		</div>

		<div class="flex gap-2 px-4 pb-2">
			<div class="h-7 w-1/4 rounded-sm bg-zinc-300"></div>
			<div class="h-7 w-2/12 rounded-sm bg-zinc-300"></div>
			<div class="h-7 w-2/12 rounded-sm bg-zinc-300"></div>
			<div class="h-7 w-2/12 rounded-sm bg-zinc-300"></div>
		</div>
	</div>
{/snippet}

<ul
	class="grid animate-pulse grid-cols-1 items-center justify-center justify-items-center gap-y-4 p-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4"
	role="status"
>
	{#each Array.from({ length: 4 }) as _}
		<li>
			{@render cardSkeleton()}
		</li>
	{/each}

	<li>
		<div
			class="flex h-44 w-[312px] flex-col justify-between rounded-lg border-2 border-solid bg-zinc-400 shadow-sm group-disabled:border-neutral-500 group-disabled:bg-neutral-300"
		></div>
	</li>
</ul>

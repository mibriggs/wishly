<script lang="ts">
	import type { RemoteFormIssue } from '@sveltejs/kit';
	import { twJoin } from 'tailwind-merge';

	interface Props {
		issues: RemoteFormIssue[] | undefined;
		formProps: {
			name: string;
			'aria-invalid': boolean | 'false' | 'true' | undefined;
			value: string | number;
		};
	}

	let { issues, formProps }: Props = $props();
</script>

<label
	class={twJoin(
		'flex w-fit select-none items-center gap-1 rounded-md border px-2 py-1 text-2xl',
		issues?.length ? 'border-red-500 bg-red-100' : 'border-transparent'
	)}
>
	$
	<input
		inputmode="decimal"
		placeholder="00.00"
		class={twJoin('w-28 focus:outline-none', !!issues?.length && 'bg-red-100')}
		id="itemCost"
		{...formProps}
	/>
</label>

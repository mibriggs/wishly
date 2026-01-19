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

<input
	inputmode="url"
	autocomplete="url"
	autocapitalize="off"
	autocorrect="off"
	spellcheck="false"
	placeholder="Url..."
	class={twJoin(
		'w-3/4 rounded-md border p-1 focus:outline-none',
		!!issues?.length && 'border-red-500 bg-red-100'
	)}
	{...formProps}
/>

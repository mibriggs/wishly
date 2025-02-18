<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div
	class="sticky top-0 z-50 flex items-center justify-between border-b-[1px] bg-neutral-100 p-4 shadow-sm"
>
	<a href="/" class="select-none text-xl font-bold">Wantify</a>
	<a href="/auth/sign-in" class="select-none underline">Sign In</a>
</div>

{@render children()}

<style>
	:global(body) {
		background-color: hsl(0, 0%, 96.1%);
		/* same as neutral 100 */
	}
</style>

<script lang="ts">
	import { lockScroll, unlockScroll } from '$lib';
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		id: string;
		class?: string;
		isOpen?: boolean;
		children?: Snippet;
		onModalClose: () => void;
	}

	let { id, onModalClose, children, isOpen = false, class: className = '' }: Props = $props();
	let modal: HTMLDialogElement;
	let isClosing: boolean = $state(false);

	$effect(() => {
		modal.onclick = closeWithOutsideTap;
	});

	$effect(() => {
		if (isOpen) {
			modal.showModal();
			lockScroll(document, window);
		} else {
			modal.close();
			unlockScroll(document, window);
		}
	});

	export function close() {
		closeModal();
	}

	const closeWithOutsideTap = (event: MouseEvent) => {
		const target = event.target;
		if (target instanceof HTMLElement && target.nodeName === 'DIALOG') {
			closeModal();
		}
	};

	const closeModal = () => {
		isClosing = true;
		modal.addEventListener('animationend', closeModalHelper, { once: true });
		onModalClose();
	};

	const closeModalHelper = () => {
		isClosing = false;
		modal.close();
	};
</script>

<dialog
	{id}
	bind:this={modal}
	data-closing={isClosing ? 'true' : 'false'}
	class={twMerge('', className)}
>
	{#if children}
		{@render children()}
	{/if}
</dialog>

<style>
	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	@keyframes fade-out {
		100% {
			opacity: 0;
		}
		0% {
			opacity: 1;
		}
	}
	@keyframes slide-up {
		0% {
			transform: translateY(100%);
		}
		100% {
			transform: translateY(0%);
		}
	}
	@keyframes slide-down {
		100% {
			transform: translateY(100%);
		}
		0% {
			transform: translateY(0%);
		}
	}

	dialog[open] {
		animation:
			slide-up 500ms forwards,
			fade-in 500ms forwards;
	}

	dialog[data-closing='true'] {
		display: block;
		pointer-events: none;
		inset: 0;
		animation:
			slide-down 500ms forwards,
			fade-out 500ms forwards;
	}
</style>

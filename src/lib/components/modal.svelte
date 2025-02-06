<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	interface ModalProps {
		id: string;
		class?: string;
		isOpen?: boolean;
		children?: Snippet;
		onModalClose: () => void;
	}
	let { id, onModalClose, children, isOpen = false, class: className = '' }: ModalProps = $props();

	let modal: HTMLDialogElement;
	let isClosing: boolean = $state(false);
	// let scrollPosition: number = $state(0);

	$effect(() => {
		modal.addEventListener('click', closeWithOutsideTap);
	});

	$effect(() => {
		if (isOpen) {
			modal.showModal();
		}
	});

	export function clear() {
		closeModal();
	}

	// $effect(() => {
	// 	if (isOpen) {
	// 		scrollPosition = window.scrollY;
	// 		document.body.style.position = 'fixed';
	// 		document.body.style.top = `-${scrollPosition}px`;
	// 		document.body.style.overflow = 'hidden';
	// 	} else {
	// 		document.body.style.overflow = '';
	// 		document.body.style.position = '';
	// 		document.body.style.top = '';
	// 		window.scrollTo(0, scrollPosition);
	// 	}
	// });

	const closeWithOutsideTap = (event: MouseEvent) => {
		const target = event.target;
		if (target instanceof HTMLElement && target.nodeName === 'DIALOG') {
			closeModal();
		}
	};

	const closeModal = () => {
		isClosing = true;
		closeModalHelper();
		// modal.addEventListener('animationend', closeModalHelper, { once: true });
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
	{:else}
		<div>Is this thing on</div>
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

	#modal[open] {
		animation:
			slide-up 350ms forwards,
			fade-in 350ms forwards;
	}

	#modal[data-closing='true'] {
		display: block;
		pointer-events: none;
		inset: 0;
		animation:
			slide-down 275ms forwards,
			fade-out 275ms forwards;
	}
</style>

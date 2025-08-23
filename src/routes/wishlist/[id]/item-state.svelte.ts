import type Modal from '$lib/components/modal.svelte';
import type { WishlistItem } from '$lib/server/db/schema';

interface WishlistItemState {
	newName: string;
	isNameEditable: boolean;

	itemToDelete: WishlistItem | undefined;
	wishlistNameElement: HTMLHeadingElement | undefined;

	newItemModal: Modal | undefined;
	isNewItemModalOpen: boolean;

	deleteItemModal: Modal | undefined;
	isDeleteItemModalOpen: boolean;

	name: string;
	url: string;
	quantity: number;
	cost: number | undefined;

	updateModalState: (newState: boolean, modal: 'NEW' | 'DELETE') => void;
	closeModal: (modal: 'NEW' | 'DELETE') => void;
	reset: () => void;
}

export class WishlistItemStateClass implements WishlistItemState {
	newName: string = $state('');
	isNameEditable: boolean = $state(false);

	itemToDelete: WishlistItem | undefined = $state(undefined);
	wishlistNameElement: HTMLHeadingElement | undefined = $state(undefined);

	newItemModal: Modal | undefined = $state(undefined);
	isNewItemModalOpen: boolean = $state(false);

	deleteItemModal: Modal | undefined = $state(undefined);
	isDeleteItemModalOpen: boolean = $state(false);

	name: string = $state('');
	url: string = $state('');
	quantity: number = $state(1);
	cost: number | undefined = $state(undefined);

	updateModalState(newState: boolean, modal: 'NEW' | 'DELETE') {
		if (modal === 'DELETE') {
			this.isDeleteItemModalOpen = newState;
		} else {
			this.isNewItemModalOpen = newState;
		}
	}

	closeModal(modal: 'NEW' | 'DELETE') {
		if (modal === 'NEW') {
			this.newItemModal?.close();
		} else {
			this.deleteItemModal?.close();
		}
	}

	reset() {
		this.name = '';
		this.url = '';
		this.quantity = 1;
		this.cost = undefined;
	}
}

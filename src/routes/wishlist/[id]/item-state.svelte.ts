import type Modal from '$lib/components/modal.svelte';
import type { WishlistItem } from '$lib/server/db/schema';

interface WishlistItemState {
	newName: string;
	isNameEditable: boolean;

	itemToDelete: WishlistItem | undefined;
	itemToEdit: WishlistItem | undefined;
	wishlistNameElement: HTMLHeadingElement | undefined;

	newItemModal: Modal | undefined;
	isNewItemModalOpen: boolean;

	deleteItemModal: Modal | undefined;
	isDeleteItemModalOpen: boolean;

	mode: 'add' | 'edit';

	name: string;
	url: string;
	quantity: number;
	cost: number | undefined;

	updateModalState: (newState: boolean, modal: 'NEW' | 'DELETE') => void;
	closeModal: (modal: 'NEW' | 'DELETE') => void;
	openAddModal: () => void;
	openEditModal: (item: WishlistItem) => void;
	reset: () => void;
}

export class WishlistItemStateClass implements WishlistItemState {
	newName: string = $state('');
	isNameEditable: boolean = $state(false);

	itemToDelete: WishlistItem | undefined = $state(undefined);
	itemToEdit: WishlistItem | undefined = $state(undefined);
	wishlistNameElement: HTMLHeadingElement | undefined = $state(undefined);

	newItemModal: Modal | undefined = $state(undefined);
	isNewItemModalOpen: boolean = $state(false);

	deleteItemModal: Modal | undefined = $state(undefined);
	isDeleteItemModalOpen: boolean = $state(false);

	mode: 'add' | 'edit' = $state('add');

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

	openAddModal() {
		this.mode = 'add';
		this.itemToEdit = undefined;
		this.reset();
		this.isNewItemModalOpen = true;
	}

	openEditModal(item: WishlistItem) {
		this.mode = 'edit';
		this.itemToEdit = item;
		this.name = item.itemName;
		this.url = item.url;
		this.quantity = item.quantity;
		this.cost = parseFloat(item.price);
		this.isNewItemModalOpen = true;
	}

	reset() {
		this.name = '';
		this.url = '';
		this.quantity = 1;
		this.cost = undefined;
	}
}

import type Modal from '$lib/components/modal.svelte';
import type { WishlistItem } from '$lib/server/db/schema';

interface WishlistItemState {
	isNameEditable: boolean;

	itemToDelete: WishlistItem | undefined;
	itemToEdit: WishlistItem | undefined;
	wishlistNameElement: HTMLHeadingElement | undefined;

	newItemModal: Modal | undefined;
	isNewItemModalOpen: boolean;

	deleteItemModal: Modal | undefined;
	isDeleteItemModalOpen: boolean;

	mode: 'add' | 'edit';

	updateModalState: (newState: boolean, modal: 'NEW' | 'DELETE') => void;
	closeModal: (modal: 'NEW' | 'DELETE') => void;
	openAddModal: () => void;
	openEditModal: () => void;
}

export class WishlistItemStateClass implements WishlistItemState {
	isNameEditable: boolean = $state(false);

	itemToDelete: WishlistItem | undefined = $state(undefined);
	itemToEdit: WishlistItem | undefined = $state(undefined);
	wishlistNameElement: HTMLHeadingElement | undefined = $state(undefined);

	newItemModal: Modal | undefined = $state(undefined);
	isNewItemModalOpen: boolean = $state(false);

	deleteItemModal: Modal | undefined = $state(undefined);
	isDeleteItemModalOpen: boolean = $state(false);

	mode: 'add' | 'edit' = $state('add');

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
		this.isNewItemModalOpen = true;
	}

	openEditModal() {
		this.mode = 'edit';
		this.isNewItemModalOpen = true;
	}
}

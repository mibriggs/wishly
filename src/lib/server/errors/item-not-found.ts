export class WishlistItemNotFoundError extends Error {
	constructor(id: string) {
		super(`Wishlist Item "${id}" not found`);
		this.name = 'WishlistItemNotFoundError';
	}
}

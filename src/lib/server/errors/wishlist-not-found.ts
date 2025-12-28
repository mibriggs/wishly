export class WishlistNotFoundError extends Error {
	constructor(id: string) {
		super(`Wishlist "${id}" not found`);
		this.name = 'WishlistNotFoundError';
	}
}

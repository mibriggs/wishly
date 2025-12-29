export class WishlistItemNotCreatedError extends Error {
	constructor(name: string) {
		super(`Wishlist Item "${name}" failed to be created`);
		this.name = 'WishlistItemNotCreatedError';
	}
}

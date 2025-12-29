export class WishlistLockedError extends Error {
	constructor() {
		super(`This wishlist is locked and cannot be modified`);
		this.name = 'WishlistLockedError';
	}
}

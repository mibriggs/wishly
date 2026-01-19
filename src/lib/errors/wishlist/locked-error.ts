export class WishlistLockedError extends Error {
	constructor() {
		super(`Cannot modify locked wishlists`);
		this.name = 'WishlistLockedError';
	}
}

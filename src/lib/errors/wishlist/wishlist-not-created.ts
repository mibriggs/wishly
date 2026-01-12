export class WishlistNotCreatedError extends Error {
	constructor(name: string) {
		super(`Wishlist "${name}" failed to be created`);
		this.name = 'WishlistNotCreatedError';
	}
}

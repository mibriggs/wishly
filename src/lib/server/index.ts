import { WISHLIST_SHARED_SALT } from '$env/static/private';
import Hashids from 'hashids';
import { WishlistService } from './db/services/wishlist.service';
import { WishlistLockedError } from './errors/wishlist/locked-error';
import { WishlistNotFoundError } from './errors/wishlist/wishlist-not-found';

const hashids = new Hashids(WISHLIST_SHARED_SALT, 10);

/**
 * Converts a UUID to a short ID using Hashids.
 * Used for creating user-friendly share links.
 *
 * @param uuid - The UUID to convert (e.g., "550e8400-e29b-41d4-a716-446655440000")
 * @returns A short encoded string representation of the UUID
 */
export function uuidToShortId(uuid: string): string {
	return hashids.encodeHex(uuid.replace(/-/g, ''));
}

/**
 * Converts a short ID back to a UUID.
 *
 * @param shortId - The short ID to decode
 * @returns The original UUID string with hyphens
 */
export function shortIdToUuid(shortId: string): string {
	const hex = hashids.decodeHex(shortId);
	return hex.replace(
		/([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})/,
		'$1-$2-$3-$4-$5'
	);
}

/**
 * Ensures a user owns the specified wishlist before allowing operations.
 *
 * @param wishlistId - The ID of the wishlist to check
 * @param userId - The ID of the user who should own the wishlist
 * @throws {WishlistNotFoundError} If the wishlist is not found or user doesn't own it
 */
export async function ensureUserOwnsWishlist(wishlistId: string, userId: string) {
	const ownsWishlist = await WishlistService.checkUserOwnsWishlist(wishlistId, userId);
	if (!ownsWishlist) {
		throw new WishlistNotFoundError(wishlistId);
	}
}

/**
 * Ensures a wishlist is not locked before allowing operations.
 *
 * @param wishlistId - The ID of the wishlist to check
 * @throws {WishlistLockedError} If the wishlist is locked
 * @throws {WishlistNotFoundError} If the wishlist is not found
 */
export async function ensureWishlistUnlocked(wishlistId: string) {
	const wishlist = await WishlistService.getIsWishlistLocked(wishlistId);
	if (wishlist.isLocked) {
		throw new WishlistLockedError();
	}
}

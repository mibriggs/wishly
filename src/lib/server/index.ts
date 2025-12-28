import { WISHLIST_SHARED_SALT } from '$env/static/private';
import Hashids from 'hashids';
import { WishlistService } from './db/services/wishlist.service';
import { WishlistLockedError } from './errors/locked-error';

const hashids = new Hashids(WISHLIST_SHARED_SALT, 10);

export function uuidToShortId(uuid: string): string {
	return hashids.encodeHex(uuid.replace(/-/g, ''));
}

export function shortIdToUuid(shortId: string): string {
	const hex = hashids.decodeHex(shortId);
	return hex.replace(
		/([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})/,
		'$1-$2-$3-$4-$5'
	);
}

export async function ensureWishlistUnlocked(wishlistId: string) {
	const wishlist = await WishlistService.getIsWishlistLocked(wishlistId);
	if (wishlist.isLocked) {
		throw new WishlistLockedError();
	}
}

import { shortIdToUuid } from '$lib/server';
import type { PageServerLoad } from './$types';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import type { SharedWishlist, Wishlist } from '$lib/server/db/schema';
import { SharedWishlistService } from '$lib/server/db/services/shared.service';
import { uuidSchema } from '$lib/schema';

export const load: PageServerLoad = async ({ params }) => {
	const maybeRealId = uuidSchema.safeParse(shortIdToUuid(params.id));

	if (!maybeRealId.success) return { empty: true };

	const realId = maybeRealId.data;
	const allData = await WishlistService.getWithShareLink(realId);

	if (allData.length === 0) return { empty: true };

	const wishlist: Wishlist = allData[0].wishlists;
	const shareLink: SharedWishlist = allData[0].shared_wishlists;
	const items = allData
		.map((wishlistData) => wishlistData.wishlist_items)
		.map((item) => {
			return {
				itemName: item.itemName,
				itemUrl: item.url,
				price: item.price,
				quantity: item.quantity
			};
		});

	const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
	const now = new Date();

	if (shareLink.deletedAt !== null) {
		return { expired: true };
	} else if (now.getTime() - shareLink.updatedAt.getTime() > THIRTY_DAYS) {
		SharedWishlistService.deleteShared(shareLink.id);
		return { expired: true };
	} else {
		return {
			wishlistName: wishlist.name,
			items: items
		};
	}
};

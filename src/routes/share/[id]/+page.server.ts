import { shortIdToUuid } from '$lib/server';
import type { PageServerLoad } from './$types';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import type { Wishlist } from '$lib/server/db/schema';
import { SharedWishlistService } from '$lib/server/db/services/shared.service';
import { uuidSchema } from '$lib/schema';

export const load: PageServerLoad = async ({ params }) => {
	const maybeRealId = uuidSchema.safeParse(shortIdToUuid(params.id));

	if (!maybeRealId.success) return { empty: true };

	const realId = maybeRealId.data;
	const allData = await WishlistService.getWithShareLink(realId);

	if (allData.length === 0) return { empty: true };

	const shareLink = allData[0]?.shared_wishlists;
	if (!shareLink) return { empty: true };

	const wishlist: Wishlist = allData[0].wishlists;
	if (!wishlist) return { empty: true };

	if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
		await SharedWishlistService.deleteShared(shareLink.id);
		return { expired: true };
	}

	const items = allData
		.map((wishlistData) => wishlistData.wishlist_items)
		.filter((item) => item !== null)
		.map((item) => ({
			itemName: item.itemName,
			itemUrl: item.url,
			price: item.price,
			quantity: item.quantity
		}));

	return {
		wishlistName: wishlist.name,
		items
	};
};

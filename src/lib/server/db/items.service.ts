import { eq } from 'drizzle-orm';
import { db } from '.';
import { wishlistItemTable, type WishlistItem } from './schema';
import { WishlistService } from './wishlist.service';

export class WishlistItemsService {
	constructor() {}

	static async findByWishlistId(wishlistId: string) {
		return await db
			.select()
			.from(wishlistItemTable)
			.where(eq(wishlistItemTable.wishlistId, wishlistId));
	}

	static async createNewItem(
		itemName: string,
		itemUrl: string,
		itemQuantity: number,
		itemPrice: string,
		wishlistId: string,
		userId: string
	) {
		const listToUpdate = await WishlistService.findByWishlistAndUserId(wishlistId, userId);
		if (listToUpdate.length > 0) {
			const items: WishlistItem[] = await db
				.insert(wishlistItemTable)
				.values({
					wishlistId: wishlistId,
					itemName: itemName,
					price: itemPrice,
					quantity: itemQuantity,
					url: itemUrl
				})
				.returning();
			return items;
		}
		return [];
	}
}

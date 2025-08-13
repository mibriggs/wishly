import { and, eq, inArray, sql } from 'drizzle-orm';
import { WishlistService } from './wishlist.service';
import { db } from '..';
import { wishlistItemTable, type WishlistItem, wishlistTable } from '../schema';

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

	static async deleteItem(itemId: string, wishlistId: string, userId: string) {
		const query = db
			.select({ wishlistId: wishlistTable.id })
			.from(wishlistTable)
			.where(eq(wishlistTable.userId, userId));

		const items: WishlistItem[] = await db
			.update(wishlistItemTable)
			.set({ isDeleted: true, deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
			.where(
				and(
					eq(wishlistItemTable.wishlistId, wishlistId),
					eq(wishlistItemTable.id, itemId),
					inArray(wishlistItemTable.wishlistId, query)
				)
			)
			.returning();
		return items;
	}
}

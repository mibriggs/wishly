import { and, eq, inArray, sql } from 'drizzle-orm';
import { WishlistService } from './wishlist.service';
import { db } from '..';
import { wishlistItemTable, type WishlistItem, wishlistTable } from '../schema';
import { getSingleObjectOrNull } from '$lib';

export class WishlistItemsService {
	constructor() {}

	static async createNewItem(
		itemName: string,
		itemUrl: string,
		itemQuantity: number,
		itemPrice: string,
		wishlistId: string
	) {
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
		return getSingleObjectOrNull<WishlistItem>(items);
	}

	static async updateItem(
		itemId: string,
		wishlistId: string,
		userId: string,
		itemName: string,
		itemUrl: string,
		itemQuantity: number,
		itemPrice: string
	) {
		const query = db
			.select({ wishlistId: wishlistTable.id })
			.from(wishlistTable)
			.where(eq(wishlistTable.userId, userId));

		const items: WishlistItem[] = await db
			.update(wishlistItemTable)
			.set({
				itemName,
				url: itemUrl,
				quantity: itemQuantity,
				price: itemPrice,
				updatedAt: sql`NOW()`
			})
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

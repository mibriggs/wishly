import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '..';
import { wishlistItemTable, type WishlistItem, wishlistTable } from '../schema';
import { ensureWishlistUnlocked } from '$lib/server';
import { WishlistItemNotCreatedError } from '$lib/server/errors/item-not-created';
import { WishlistItemNotFoundError } from '$lib/server/errors/item-not-found';

export class WishlistItemsService {
	constructor() {}

	/**
	 * Creates a new item in a wishlist.
	 *
	 * @param itemName - The name of the item
	 * @param itemUrl - The URL of the item
	 * @param itemQuantity - The quantity of the item
	 * @param itemPrice - The price of the item as a string
	 * @param wishlistId - The ID of the wishlist to add the item to
	 * @returns The newly created item object
	 * @throws {WishlistLockedError} If the wishlist is locked
	 * @throws {WishlistNotFoundError} If the wishlist is not found
	 * @throws {WishlistItemNotCreatedError} If the item creation fails
	 */
	static async createNewItem(
		itemName: string,
		itemUrl: string,
		itemQuantity: number,
		itemPrice: string,
		wishlistId: string
	) {
		await ensureWishlistUnlocked(wishlistId);

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

		if (items.length === 0) {
			throw new WishlistItemNotCreatedError(itemName);
		}

		return items[0];
	}

	/**
	 * Updates an existing item in a wishlist.
	 *
	 * @param itemId - The ID of the item to update
	 * @param wishlistId - The ID of the wishlist containing the item
	 * @param userId - The ID of the user who owns the wishlist
	 * @param itemName - The updated name of the item
	 * @param itemUrl - The updated URL of the item
	 * @param itemQuantity - The updated quantity of the item
	 * @param itemPrice - The updated price of the item as a string
	 * @returns The updated item object
	 * @throws {WishlistLockedError} If the wishlist is locked
	 * @throws {WishlistNotFoundError} If the wishlist is not found
	 * @throws {WishlistItemNotFoundError} If the item is not found or doesn't belong to the user's wishlist
	 */
	static async updateItem(
		itemId: string,
		wishlistId: string,
		userId: string,
		itemName: string,
		itemUrl: string,
		itemQuantity: number,
		itemPrice: string
	) {
		await ensureWishlistUnlocked(wishlistId);

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

		if (items.length === 0) {
			throw new WishlistItemNotFoundError(itemId);
		}

		return items[0];
	}

	/**
	 * Soft deletes an item from a wishlist.
	 *
	 * @param itemId - The ID of the item to delete
	 * @param wishlistId - The ID of the wishlist containing the item
	 * @param userId - The ID of the user who owns the wishlist
	 * @returns The deleted item object
	 * @throws {WishlistLockedError} If the wishlist is locked
	 * @throws {WishlistNotFoundError} If the wishlist is not found
	 * @throws {WishlistItemNotFoundError} If the item is not found or doesn't belong to the user's wishlist
	 */
	static async deleteItem(itemId: string, wishlistId: string, userId: string) {
		await ensureWishlistUnlocked(wishlistId);

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

		if (items.length === 0) {
			throw new WishlistItemNotFoundError(itemId);
		}

		return items[0];
	}
}

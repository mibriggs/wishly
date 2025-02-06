import { eq } from 'drizzle-orm';
import { db } from '.';
import { wishlistItemTable } from './schema';

export class WishlistItemsService {
	constructor() {}

	static async findByWishlistId(wishlistId: string) {
		return await db
			.select()
			.from(wishlistItemTable)
			.where(eq(wishlistItemTable.wishlistId, wishlistId));
	}
}

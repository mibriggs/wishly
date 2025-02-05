import { db } from '.';
import { userTable, type User } from './schema';
import { eq } from 'drizzle-orm';

export class UserService {
	constructor() {}

	static async createGuestUser(guestId: string) {
		const user: User[] = await db
			.insert(userTable)
			.values({
				guestId: guestId,
				isGuest: true
			})
			.returning();
		return user;
	}

	static async findByGuestId(guestId: string) {
		const guestUser: User[] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.guestId, guestId));
		return guestUser;
	}
}

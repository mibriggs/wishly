import { getSingleObjectOrNull } from '$lib';
import { UserNotFoundError } from '$lib/errors/user/user-not-found';
import { UserNotCreatedError } from '$lib/errors/user/user-not-created';
import { db } from '..';
import { userTable, type User } from '../schema';
import { eq } from 'drizzle-orm';

export class UserService {
	constructor() {}

	/**
	 * Creates a new guest user with the specified guest ID.
	 *
	 * @param guestId - The unique identifier for the guest user
	 * @returns The newly created guest user object
	 * @throws {UserNotCreatedError} If the user creation fails
	 */
	static async createGuestUser(guestId: string): Promise<User> {
		const users: User[] = await db
			.insert(userTable)
			.values({
				guestId: guestId,
				isGuest: true
			})
			.returning();

		if (users.length === 0) {
			throw new UserNotCreatedError();
		}

		return users[0];
	}

	/**
	 * Finds a guest user by their guest ID.
	 *
	 * @param guestId - The unique guest identifier
	 * @returns The guest user object
	 * @throws {UserNotFoundError} If no user with the given guest ID is found
	 */
	static async findByGuestId(guestId: string): Promise<User> {
		const res: User[] = await db.select().from(userTable).where(eq(userTable.guestId, guestId));

		if (res.length === 0) {
			throw new UserNotFoundError(guestId);
		}
		return res[0];
	}

	/**
	 * Finds a user by their user ID.
	 *
	 * @param userId - The ID of the user to find
	 * @returns The user object
	 * @throws {UserNotFoundError} If the user is not found
	 */
	static async findById(userId: string) {
		const users: User[] = await db.select().from(userTable).where(eq(userTable.id, userId));

		if (users.length === 0) {
			throw new UserNotFoundError(userId);
		}

		return users[0];
	}

	static async findByOauthId(oauthId: string) {
		const users: User[] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.oauthId, String(oauthId)));

		return getSingleObjectOrNull<User>(users);
	}

	static async makeGuestUserOAuthUser(guestId: string, oauthId: string, oauthUsername: string) {
		const users: User[] = await db
			.update(userTable)
			.set({
				oauthId: oauthId,
				username: oauthUsername,
				isGuest: false,
				guestId: null
			})
			.where(eq(userTable.guestId, guestId))
			.returning();

		return getSingleObjectOrNull<User>(users);
	}

	static async createOauthUser(oauthId: string, oauthUsername: string) {
		const users: User[] = await db
			.insert(userTable)
			.values({ oauthId: String(oauthId), username: oauthUsername, isGuest: false })
			.returning();

		return getSingleObjectOrNull<User>(users);
	}
}

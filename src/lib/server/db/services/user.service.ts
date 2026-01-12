import { getSingleObjectOrNull } from '$lib';
import { UserNotFoundError } from '$lib/errors/user/user-not-found';
import { UserNotCreatedError } from '$lib/errors/user/user-not-created';
import { db } from '..';
import { userTable, type User } from '../schema';
import { eq } from 'drizzle-orm';

type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'DISCORD';
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

	static async findByOauthId(oauthId: string | number, authProvider: OAuthProvider) {
		let users: User[] = [];

		switch (authProvider) {
			case 'GOOGLE':
				users = await db
					.select()
					.from(userTable)
					.where(eq(userTable.googleId, String(oauthId)));
				break;
			case 'GITHUB':
				users = await db
					.select()
					.from(userTable)
					.where(eq(userTable.githubId, Number(oauthId)));
				break;
			case 'DISCORD':
				users = await db
					.select()
					.from(userTable)
					.where(eq(userTable.discordId, String(oauthId)));
				break;
		}

		return getSingleObjectOrNull<User>(users);
	}

	static async makeGuestUserOAuthUser(
		guestId: string,
		oauthId: string | number,
		oauthUsername: string,
		authProvider: OAuthProvider
	) {
		let users: User[] = [];

		switch (authProvider) {
			case 'GOOGLE':
				users = await db
					.update(userTable)
					.set({
						googleId: String(oauthId),
						googleUsername: oauthUsername,
						isGuest: false,
						guestId: null
					})
					.where(eq(userTable.guestId, guestId))
					.returning();
				break;
			case 'GITHUB':
				users = await db
					.update(userTable)
					.set({
						githubId: Number(oauthId),
						githubUsername: oauthUsername,
						isGuest: false,
						guestId: null
					})
					.where(eq(userTable.guestId, guestId))
					.returning();
				break;
			case 'DISCORD':
				users = await db
					.update(userTable)
					.set({
						discordId: String(oauthId),
						discordUsername: oauthUsername,
						isGuest: false,
						guestId: null
					})
					.where(eq(userTable.guestId, guestId))
					.returning();
				break;
		}

		return getSingleObjectOrNull<User>(users);
	}

	static async createOauthUser(
		oauthId: string | number,
		oauthUsername: string,
		authProvider: OAuthProvider
	) {
		let users: User[] = [];

		switch (authProvider) {
			case 'GOOGLE':
				users = await db
					.insert(userTable)
					.values({ googleId: String(oauthId), googleUsername: oauthUsername, isGuest: false })
					.returning();
				break;
			case 'GITHUB':
				users = await db
					.insert(userTable)
					.values({ githubId: Number(oauthId), githubUsername: oauthUsername, isGuest: false })
					.returning();
				break;
			case 'DISCORD':
				users = await db
					.insert(userTable)
					.values({ discordId: String(oauthId), discordUsername: oauthUsername, isGuest: false })
					.returning();
				break;
		}

		return getSingleObjectOrNull<User>(users);
	}
}

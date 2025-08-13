import { getSingleObjectOrNull } from '$lib';
import { db } from '..';
import { userTable, type User } from '../schema';
import { eq } from 'drizzle-orm';

type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'DISCORD';
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

	static async findById(userId: string) {
		const users: User[] = await db.select().from(userTable).where(eq(userTable.id, userId));

		return getSingleObjectOrNull<User>(users);
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

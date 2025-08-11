import { getSingleObjectOrNull } from '$lib';
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

	static async findById(userId: string) {
		const users: User[] = await db.select().from(userTable).where(eq(userTable.id, userId));

		return getSingleObjectOrNull<User>(users);
	}

	static async findByGithubId(githubId: number) {
		const users: User[] = await db.select().from(userTable).where(eq(userTable.githubId, githubId));

		return getSingleObjectOrNull<User>(users);
	}

	static async makeGuestUserGithubUser(guestId: string, githubId: number, githubUsername: string) {
		const users: User[] = await db
			.update(userTable)
			.set({ githubId: githubId, githubUsername: githubUsername, isGuest: false, guestId: null })
			.where(eq(userTable.guestId, guestId))
			.returning();
		return getSingleObjectOrNull<User>(users);
	}

	static async createGithubUser(githubId: number, githubUsername: string) {
		const users: User[] = await db
			.insert(userTable)
			.values({
				githubId: githubId,
				githubUsername: githubUsername,
				isGuest: false
			})
			.returning();
		return getSingleObjectOrNull<User>(users);
	}
}

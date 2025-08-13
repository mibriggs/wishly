import { db } from '..';
import { and, eq, lte, sql } from 'drizzle-orm';
import { sessionTable, type Session } from '../schema';
import { getSingleObjectOrNull } from '$lib';

export class SessionService {
	constructor() {}

	static async insertSession(
		sessionId: string,
		userId: string,
		secretHash: Uint8Array
	): Promise<Session | null> {
		const sessions = await db
			.insert(sessionTable)
			.values({
				id: sessionId,
				userId,
				secretHash
			})
			.returning();
		return getSingleObjectOrNull<Session>(sessions);
	}

	static async getSession(sessionId: string) {
		const sessions: Session[] = await db
			.select()
			.from(sessionTable)
			.where(eq(sessionTable.id, sessionId));

		return getSingleObjectOrNull<Session>(sessions);
	}

	static async deleteSession(sessionId: string) {
		const sessions: Session[] = await db
			.update(sessionTable)
			.set({ deletedAt: sql`NOW()` })
			.where(eq(sessionTable.id, sessionId))
			.returning();

		return getSingleObjectOrNull<Session>(sessions);
	}

	static async updateLastActivity(sessionId: string, lastActivityAt: Date) {
		const sessions: Session[] = await db
			.update(sessionTable)
			.set({ lastActivityAt: sql`NOW()` })
			.where(and(eq(sessionTable.id, sessionId), lte(sessionTable.lastActivityAt, lastActivityAt)))
			.returning();

		return getSingleObjectOrNull<Session>(sessions);
	}
}

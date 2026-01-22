import { db } from '..';
import { and, eq, lte, sql } from 'drizzle-orm';
import { sessionTable, type Session } from '../schema';
import { getSingleObjectOrNull } from '$lib';
import { SessionNotCreatedError } from '$lib/errors/session/session-not-created';
import { SessionNotFoundError } from '$lib/errors/session/session-not-found';

export class SessionService {
	constructor() {}

	/**
	 * Inserts a new session into the database.
	 *
	 * @param sessionId - The unique identifier for the session
	 * @param userId - The ID of the user the session belongs to
	 * @param secretHash - The hashed secret for session validation
	 * @returns The newly created session object
	 * @throws {SessionNotCreatedError} If the session creation fails
	 */
	static async insertSession(
		sessionId: string,
		userId: string,
		secretHash: Uint8Array
	): Promise<Session> {
		const sessions = await db
			.insert(sessionTable)
			.values({
				id: sessionId,
				userId,
				secretHash
			})
			.returning();

		if (sessions.length === 0) {
			throw new SessionNotCreatedError();
		}

		return sessions[0];
	}

	/**
	 * Retrieves a session by its ID.
	 *
	 * @param sessionId - The unique identifier of the session
	 * @returns The session object
	 * @throws {SessionNotFoundError} If the session is not found
	 */
	static async getSession(sessionId: string): Promise<Session> {
		const sessions: Session[] = await db
			.select()
			.from(sessionTable)
			.where(eq(sessionTable.id, sessionId));

		if (sessions.length === 0) {
			throw new SessionNotFoundError();
		}

		return sessions[0];
	}

	/**
	 * Hard deletes a session.
	 * This is an idempotent operation - if the session doesn't exist, returns null.
	 *
	 * @param sessionId - The unique identifier of the session to delete
	 * @returns The deleted session object, or null if the session was not found
	 */
	static async deleteSession(sessionId: string): Promise<Session | null> {
		const sessions: Session[] = await db
			.delete(sessionTable)
			.where(eq(sessionTable.id, sessionId))
			.returning();

		return getSingleObjectOrNull<Session>(sessions);
	}

	/**
	 * Updates the last activity timestamp for a session.
	 * Includes race condition protection - only updates if the current lastActivityAt is less than or equal to the provided value.
	 *
	 * @param sessionId - The unique identifier of the session
	 * @param lastActivityAt - The previous lastActivityAt timestamp (for race condition check)
	 * @returns The updated session object, or null if the session was not found or already updated by another request
	 */
	static async updateLastActivity(
		sessionId: string,
		lastActivityAt: Date
	): Promise<Session | null> {
		const sessions: Session[] = await db
			.update(sessionTable)
			.set({ lastActivityAt: sql`NOW()` })
			.where(and(eq(sessionTable.id, sessionId), lte(sessionTable.lastActivityAt, lastActivityAt)))
			.returning();

		return getSingleObjectOrNull<Session>(sessions);
	}
}

import { constantTimeEqual, generateSecureRandomString, hashSecret } from '$lib';
import type { Session } from '../db/schema';
import { SessionService } from '../db/services/session.service';
import { SessionNotFoundError } from '../errors/session/session-not-found';

type SessionWithToken = Session & { token: string };

export const INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10; // 10 days
const ACTIVITY_CHECK_INTERVAL_SECONDS = 60 * 60; // 1 hour
const DUMMY_HASH_32 = new Uint8Array(32);

export class SessionUtils {
	constructor() {}

	/**
	 * Creates a new session for a user with a secure token.
	 * Generates a session ID and secret, hashes the secret, and stores the session in the database.
	 *
	 * @param userId - The ID of the user to create a session for
	 * @returns The created session with the unhashed token (format: "sessionId.secret")
	 * @throws {SessionNotCreatedError} If the session creation fails in the database
	 */
	static async createSession(userId: string): Promise<SessionWithToken> {
		const id: string = generateSecureRandomString();
		const secret: string = generateSecureRandomString();
		const hashedSecret: Uint8Array = await hashSecret(secret);

		const session: Session = await SessionService.insertSession(id, userId, hashedSecret);
		const sessionWithToken: SessionWithToken = { ...session, token: `${id}.${secret}` };
		return sessionWithToken;
	}

	/**
	 * Validates a session token and returns the associated session if valid.
	 * Uses constant-time comparison to prevent timing attacks.
	 *
	 * @param clientSessionToken - The session token from the client (format: "sessionId.secret")
	 * @returns The valid session object, or null if the token is invalid, expired, or not found
	 * @throws Re-throws any unexpected errors from the database layer
	 */
	static async validateSessionToken(clientSessionToken: string): Promise<Session | null> {
		const tokenParts = clientSessionToken.split('.');

		if (tokenParts.length !== 2) {
			return null;
		}

		const sessionId = tokenParts[0];
		const plainTextSessionSecret = tokenParts[1];

		let session: Session | null = null;
		let sessionExists = true;

		try {
			session = await SessionService.getSession(sessionId);
		} catch (e: unknown) {
			if (e instanceof SessionNotFoundError) {
				sessionExists = false;
			} else {
				throw e;
			}
		}

		const hashedClientSession: Uint8Array = await hashSecret(plainTextSessionSecret);
		const hashedServerSession: Uint8Array =
			sessionExists && session ? session.secretHash : DUMMY_HASH_32;

		const validSecret = constantTimeEqual(hashedClientSession, hashedServerSession);

		// Always perform the comparison even if session doesn't exist
		if (!sessionExists || !session) return null;
		if (!validSecret) return null;
		if (session.deletedAt !== null) return null;

		const now = new Date();
		if (now.getTime() - session.lastActivityAt.getTime() >= INACTIVITY_TIMEOUT_SECONDS * 1000) {
			// TODO: check if deleted properly?
			await SessionService.deleteSession(sessionId);
			return null;
		} else if (
			now.getTime() - session.lastActivityAt.getTime() >=
			ACTIVITY_CHECK_INTERVAL_SECONDS * 1000
		) {
			const updated: Session | null = await SessionService.updateLastActivity(
				sessionId,
				session.lastActivityAt
			);
			if (updated) {
				session.lastActivityAt = updated.lastActivityAt;
			}
			// TODO: else session wasn't found throw error?
		}
		return session;
	}

	static async deleteSessionToken(clientSessionToken: string): Promise<Session | null> {
		const tokenParts = clientSessionToken.split('.');

		if (tokenParts.length !== 2) {
			return null;
		}

		const sessionId = tokenParts[0];
		const session: Session | null = await SessionService.deleteSession(sessionId);

		return session;
	}
}

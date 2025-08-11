import { constantTimeEqual, generateSecureRandomString, hashSecret } from '$lib';
import type { Session } from '../db/schema';
import { SessionService } from '../db/session.service';

type SessionWithToken = Session & { token: string };
const INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10; // 10 days
const ACTIVITY_CHECK_INTERVAL_SECONDS = 60 * 60; // 1 hour
const DUMMY_HASH_32 = new Uint8Array(32);

export class SessionUtils {
	constructor() {}

	static async createSession(userId: string): Promise<SessionWithToken | null> {
		const id: string = generateSecureRandomString();
		const secret: string = generateSecureRandomString();
		const hashedSecret: Uint8Array = await hashSecret(secret);

		const session: Session | null = await SessionService.insertSession(id, userId, hashedSecret);

		const sessionWithToken: SessionWithToken | null = session
			? { ...session, token: `${id}.${secret}` }
			: null;
		return sessionWithToken;
	}

	static async validateSessionToken(clientSessionToken: string): Promise<Session | null> {
		const tokenParts = clientSessionToken.split('.');

		if (tokenParts.length !== 2) {
			return null;
		}

		const sessionId = tokenParts[0];
		const plainTextSessionSecret = tokenParts[1];

		const session: Session | null = await SessionService.getSession(sessionId);

		const hashedClientSession: Uint8Array = await hashSecret(plainTextSessionSecret);
		const hashedServerSession: Uint8Array = session?.secretHash ?? DUMMY_HASH_32;

		const validSecret = constantTimeEqual(hashedClientSession, hashedServerSession);

		if (!validSecret || session === null) return null;
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

import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { UserService } from './db/services/user.service';
import type { Session, User } from './db/schema';
import { SessionUtils } from './session/session';
import { UserNotFoundError } from '$lib/errors/user/user-not-found';

/**
 * Authenticates a user for a request.
 * Attempts session-based authentication first, then falls back to guest user creation.
 *
 * @param event - The SvelteKit request event
 * @returns The authenticated user or a guest user
 * @throws {UserNotCreatedError} If guest user creation fails (catastrophic failure)
 */
export const authenticateUser = async (event: RequestEvent) => {
	// check if there's a full user
	const sessionToken = event.cookies.get('session_token');
	if (sessionToken) {
		const validSession: Session | null = await SessionUtils.validateSessionToken(sessionToken);
		if (validSession) {
			const userId = validSession.userId;
			try {
				return await UserService.findById(userId);
			} catch (e: unknown) {
				if (e instanceof UserNotFoundError) {
					// Session exists but user doesn't - fall back to guest
					// Continue to guest user creation below
				} else {
					throw e;
				}
			}
		}
	}

	// get or create guest
	const guestId = event.cookies.get('wantify_guest');

	if (guestId) {
		try {
			return await UserService.findByGuestId(guestId);
		} catch (e: unknown) {
			if (e instanceof UserNotFoundError) {
				return await createGuestUser(event.cookies);
			}
			throw e;
		}
	}

	return await createGuestUser(event.cookies);
};

const createGuestUser = async (cookies: Cookies): Promise<User> => {
	// maybe hash it?
	const guestId = crypto.randomUUID();
	const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;
	const yearFromNow = new Date(Date.now() + ONE_YEAR);
	cookies.set('wantify_guest', guestId, {
		maxAge: ONE_YEAR,
		expires: yearFromNow,
		path: '/'
	});
	return await UserService.createGuestUser(guestId);
};

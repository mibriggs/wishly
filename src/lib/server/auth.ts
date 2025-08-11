import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { UserService } from './db/user.service';
import type { Session, User } from './db/schema';
import { SessionUtils } from './session/session';

export const authenticateUser = async (event: RequestEvent) => {
	// check if there's a full user
	const sessionToken = event.cookies.get('session_token');
	if (sessionToken) {
		const validSession: Session | null = await SessionUtils.validateSessionToken(sessionToken);
		if (validSession) {
			const userId = validSession.userId;
			const user = await UserService.findById(userId);
			if (user) return user;
		}
	}

	// get or create guest
	let guestId = event.cookies.get('wantify_guest');
	let guestUser: User[] = [];

	if (!guestId) {
		await createGuestUser(event.cookies);
		guestId = event.cookies.get('wantify_guest') as string;
	}

	guestUser = await UserService.findByGuestId(guestId);
	if (guestUser.length === 0) {
		guestUser = await createGuestUser(event.cookies);
	}
	return guestUser[0];
};

const createGuestUser = async (cookies: Cookies) => {
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

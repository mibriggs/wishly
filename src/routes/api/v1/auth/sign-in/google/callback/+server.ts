import { SessionNotCreatedError } from '$lib/errors/session/session-not-created';
import { UserService } from '$lib/server/db/services/user.service';
import { google } from '$lib/server/providers/google';
import { INACTIVITY_TIMEOUT_SECONDS, SessionUtils } from '$lib/server/session/session';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import { decodeIdToken, type OAuth2Tokens } from 'arctic';
import { z } from 'zod/v4';

const googleClaimsSchema = z.object({
	iss: z.string(),
	azp: z.string(),
	aud: z.string(),
	sub: z.string(),
	at_hash: z.string(),
	name: z.string(),
	picture: z.string(),
	given_name: z.string(),
	family_name: z.string(),
	iat: z.number(),
	exp: z.number()
});

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code: string | undefined = url.searchParams.get('code') ?? undefined;
	const state: string | undefined = url.searchParams.get('state') ?? undefined;
	const storedState: string | undefined = cookies.get('google_oauth_state');
	const codeVerifier: string | undefined = cookies.get('google_code_verifier');

	if (!code || !state || !storedState || !codeVerifier) return new Response(null, { status: 400 });
	if (state !== storedState) return new Response(null, { status: 400 });

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e: unknown) {
		return new Response(null, { status: 400 });
	}

	const maybeClaims = googleClaimsSchema.safeParse(decodeIdToken(tokens.idToken()));

	if (!maybeClaims.success) return new Response(null, { status: 400 });

	const googleUserId = maybeClaims.data.sub;
	const username = maybeClaims.data.name;

	const existingUser = await UserService.findByOauthId(googleUserId, 'GOOGLE');

	if (existingUser) {
		return createSessionOrThrow(existingUser.id, cookies);
	}

	const guestId = cookies.get('wantify_guest');

	if (guestId) {
		const fullUser = await UserService.makeGuestUserOAuthUser(
			guestId,
			googleUserId,
			username,
			'GOOGLE'
		);

		if (fullUser) {
			cookies.delete('wantify_guest', {
				path: '/'
			});
			return createSessionOrThrow(fullUser.id, cookies);
		}

		return new Response(null, {
			status: 400
		});
	} else {
		const newUser = await UserService.createOauthUser(googleUserId, username, 'GOOGLE');

		if (newUser) {
			return createSessionOrThrow(newUser.id, cookies);
		}

		return new Response(null, {
			status: 400
		});
	}
};

/**
 * Creates a new session for a user, sets the session cookie, and returns a redirect response.
 *
 * @param userId - The ID of the user to create a session for
 * @param cookies - The SvelteKit cookies object to set the session token
 * @returns A Response object with 302 redirect on success, 422 on session creation failure, or 500 on unexpected error
 * @throws {SessionNotCreatedError} Caught internally and returns a 422 response
 */
async function createSessionOrThrow(userId: string, cookies: Cookies) {
	try {
		const session = await SessionUtils.createSession(userId);
		const headers: Headers = new Headers();
		headers.append('Location', '/');

		cookies.set('session_token', session.token, {
			path: '/',
			httpOnly: true,
			maxAge: INACTIVITY_TIMEOUT_SECONDS,
			expires: new Date(session.lastActivityAt.getTime() + INACTIVITY_TIMEOUT_SECONDS * 1000)
		});

		return new Response(null, {
			status: 302,
			headers: headers
		});
	} catch (e: unknown) {
		if (e instanceof SessionNotCreatedError) {
			return new Response(null, {
				status: 422
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

import { githubUserSchema, type GithubUser } from '$lib/schema';
import { UserService } from '$lib/server/db/services/user.service';
import { SessionNotCreatedError } from '$lib/errors/session/session-not-created';
import { github } from '$lib/server/providers/github';
import { INACTIVITY_TIMEOUT_SECONDS, SessionUtils } from '$lib/server/session/session';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

const GITHUB_URL = 'https://api.github.com/user';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const code: string | null = url.searchParams.get('code');
	const state: string | null = url.searchParams.get('state');
	const storedState: string | null = cookies.get('github_oauth_state') ?? null;

	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400
		});
	}

	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		return new Response(null, {
			status: 400
		});
	}

	const headers: Headers = new Headers();
	headers.append('Authorization', `Bearer ${tokens.accessToken()}`);

	const githubUserResponse = await fetch(GITHUB_URL, {
		headers: headers
	});

	const response = (await githubUserResponse.json()) as unknown;
	const maybeGithubUser = githubUserSchema.safeParse(response);

	if (maybeGithubUser.error) {
		return new Response(null, {
			status: 400
		});
	}

	const githubUser: GithubUser = maybeGithubUser.data;
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;

	const existingUser = await UserService.findByOauthId(githubUserId, 'GITHUB');

	if (existingUser) {
		return createSessionOrThrow(existingUser.id, cookies);
	}

	const guestId = cookies.get('wantify_guest');
	if (guestId) {
		const fullUser = await UserService.makeGuestUserOAuthUser(
			guestId,
			githubUserId,
			githubUsername,
			'GITHUB'
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
		const newUser = await UserService.createOauthUser(githubUserId, githubUsername, 'GITHUB');

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

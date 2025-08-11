import { UserService } from '$lib/server/db/user.service';
import { github } from '$lib/server/providers/github';
import { SessionUtils } from '$lib/server/session/session';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

const GITHUB_URL = 'https://api.github.com/user';

export const GET: RequestHandler = async ({ url, cookies, fetch, locals }) => {
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

	const githubUser = await githubUserResponse.json(); // TODO: better checking on this
	const githubUserId = githubUser.id as number;
	const githubUsername = githubUser.login;

	const existingUser = await UserService.findByGithubId(githubUserId);

	if (existingUser) {
		return createSessionOrThrow(existingUser.id, cookies);
	}

	const guestId = cookies.get('wantify_guest');
	if (guestId) {
		const fullUser = await UserService.makeGuestUserGithubUser(
			guestId,
			githubUserId,
			githubUsername
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
		const newUser = await UserService.createGithubUser(githubUserId, githubUsername);
		if (newUser) {
			return createSessionOrThrow(newUser.id, cookies);
		}
		return new Response(null, {
			status: 400
		});
	}
};

async function createSessionOrThrow(userId: string, cookies: Cookies) {
	const session = await SessionUtils.createSession(userId);
	if (session) {
		const headers: Headers = new Headers();
		headers.append('Location', '/');

		cookies.set('session_token', session.token, {
			path: '/',
			httpOnly: true
		});

		return new Response(null, {
			status: 302,
			headers: headers
		});
	}
	return new Response(null, {
		status: 400
	});
}

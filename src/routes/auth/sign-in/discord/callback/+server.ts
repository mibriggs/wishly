import { discordUserSchema, type DiscordUser } from '$lib/schema';
import { UserService } from '$lib/server/db/services/user.service';
import { discord } from '$lib/server/providers/discord';
import { INACTIVITY_TIMEOUT_SECONDS, SessionUtils } from '$lib/server/session/session';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

const DISCORD_URL = 'https://discord.com/api/users/@me';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const code: string | null = url.searchParams.get('code');
	const state: string | null = url.searchParams.get('state');
	const storedState: string | null = cookies.get('discord_oauth_state') ?? null;
	const storedCodeVerifier: string | null = cookies.get('discord_code_verifier') ?? null;

	if (code === null || state === null || storedState === null || storedCodeVerifier === null) {
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
		tokens = await discord.validateAuthorizationCode(code, storedCodeVerifier);
	} catch (e) {
		return new Response(null, {
			status: 400
		});
	}

	const headers: Headers = new Headers();
	headers.append('Authorization', `Bearer ${tokens.accessToken()}`);

	const discordUserResponse = await fetch(DISCORD_URL, {
		headers: headers
	});

	const response = (await discordUserResponse.json()) as unknown; // TODO: Better Validation
	const maybeDiscordUser = discordUserSchema.safeParse(response);

	if (maybeDiscordUser.error) {
		return new Response(null, {
			status: 400
		});
	}

	const discordUser: DiscordUser = maybeDiscordUser.data;
	const discordUserId = discordUser.id;
	const discordUsername = discordUser.username;

	const existingUser = await UserService.findByOauthId(discordUserId, 'DISCORD');

	if (existingUser) {
		return createSessionOrThrow(existingUser.id, cookies);
	}

	const guestId = cookies.get('wantify_guest');
	if (guestId) {
		const fullUser = await UserService.makeGuestUserOAuthUser(
			guestId,
			discordUserId,
			discordUsername,
			'DISCORD'
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
		const newUser = await UserService.createOauthUser(discordUserId, discordUsername, 'DISCORD');

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
			httpOnly: true,
			maxAge: INACTIVITY_TIMEOUT_SECONDS,
			expires: new Date(session.lastActivityAt.getTime() + INACTIVITY_TIMEOUT_SECONDS * 1000)
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

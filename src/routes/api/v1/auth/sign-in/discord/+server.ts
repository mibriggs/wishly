import { discord } from '$lib/server/providers/discord';
import type { RequestHandler } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';

export const GET: RequestHandler = ({ cookies }) => {
	const state: string = generateState();
	const codeVerifier: string = generateCodeVerifier();
	const scopes: string[] = ['identify'];

	const discordUrl: URL = discord.createAuthorizationURL(state, codeVerifier, scopes);

	cookies.set('discord_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	cookies.set('discord_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	const headers: Headers = new Headers();
	headers.append('Location', discordUrl.href);

	return new Response(null, {
		status: 302,
		headers: headers
	});
};

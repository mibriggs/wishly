import { google } from '$lib/server/providers/google';
import type { RequestHandler } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';

export const GET: RequestHandler = ({ cookies }) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile']);

	cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});

	const headers: Headers = new Headers();
	headers.append('Location', url.toString());

	return new Response(null, {
		status: 302,
		headers: headers
	});
};

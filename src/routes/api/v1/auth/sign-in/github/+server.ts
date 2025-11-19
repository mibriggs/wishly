import { github } from '$lib/server/providers/github';
import type { RequestHandler } from '@sveltejs/kit';
import { generateState } from 'arctic';

export const GET: RequestHandler = ({ cookies }) => {
	const state: string = generateState();
	const githubUrl: URL = github.createAuthorizationURL(state, []);

	cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	const headers: Headers = new Headers();
	headers.append('Location', githubUrl.href);

	return new Response(null, {
		status: 302,
		headers: headers
	});
};

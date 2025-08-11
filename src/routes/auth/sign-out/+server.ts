import { SessionUtils } from '$lib/server/session/session';
import type { RequestHandler } from '@sveltejs/kit';
import { generateState } from 'arctic';
import github from 'lucide-svelte/icons/github';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionToken = cookies.get('session_token');

	if (sessionToken) {
		const deletedSession = await SessionUtils.deleteSessionToken(sessionToken);

		cookies.delete('session_token', {
			path: '/'
		});

		if (deletedSession) {
			const headers: Headers = new Headers();
			headers.append('Location', '/');

			return new Response(null, {
				status: 302,
				headers: headers
			});
		}
	}

	return new Response(null, {
		status: 401
	});
};

import { SessionUtils } from '$lib/server/session/session';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionToken = cookies.get('session_token');

	if (sessionToken) {
		const deletedSession = await SessionUtils.deleteSessionToken(sessionToken);

		cookies
			.getAll()
			.filter((cookie) => cookie.name !== 'wantify_guest')
			.forEach((cookie) => cookies.delete(cookie.name, { path: '/' }));

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

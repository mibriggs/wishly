import { authenticateUser } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = await authenticateUser(event);

	const response: Response = await resolve(event);
	return response;
};

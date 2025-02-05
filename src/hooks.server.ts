import { authenticateUser } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// here we can auth the user. I think I can do something like
	// 1. check if theres a full user if there is user this user
	// 2. check if guest user only if no full user
	// 3. create guest user, only if no guest user
	event.locals.user = await authenticateUser(event);

	const response: Response = await resolve(event);
	return response;
};

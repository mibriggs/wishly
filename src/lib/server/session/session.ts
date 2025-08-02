import { generateSecureRandomString, hashSecret } from '$lib';
import type { SessionWithToken } from './schema';

// Creating Sessions
const createSession = async () => {
	// I feel like sessions should have a user id associated with them?
	const id: string = generateSecureRandomString();
	const secret: string = generateSecureRandomString();
	const hashedSecret: Uint8Array = await hashSecret(secret);

	const session: SessionWithToken = {
		id,
		secretHash: hashedSecret,
		token: `${id}.${secret}`,
		createdAt: new Date()
	};

	return session;
};

// place files you want to import through the `$lib` alias in this folder.

import { encodeBase32LowerCase } from '@oslojs/encoding';

// Generating IDs and Secrets
export const generateSecureRandomString = (): string => {
	const bytes: Uint8Array = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	const encodedString: string = encodeBase32LowerCase(bytes);
	return encodedString;
};

export const hashSecret = async (secret: string): Promise<Uint8Array> => {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	return new Uint8Array(secretHashBuffer);
};

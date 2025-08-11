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

export const constantTimeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i];
	}
	return c === 0;
};

export function getSingleObjectOrNull<T>(list: readonly T[]): T | null {
	return list.length === 1 ? list[0] : null;
}

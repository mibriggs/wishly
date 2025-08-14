// place files you want to import through the `$lib` alias in this folder.
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { PUBLIC_HASHIDS_SALT } from '$env/static/public';
import Hashids from 'hashids';

const hashids = new Hashids(PUBLIC_HASHIDS_SALT, 10);

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

export function uuidToShortId(uuid: string): string {
	return hashids.encodeHex(uuid.replace(/-/g, ''));
}

export function shortIdToUuid(shortId: string): string {
	const hex = hashids.decodeHex(shortId);
	return hex.replace(
		/([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})/,
		'$1-$2-$3-$4-$5'
	);
}

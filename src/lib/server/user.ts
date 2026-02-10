import { encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';

export function verifyUsernameInput(username: string): string | undefined {
	if (username.length < 3 || username.length > 32)
		return 'Username must be between 3 and 32 characters';

	if (username.trim() !== username) return 'Username cannot include whitespace';
	return;
}
export const generateRandomOTP = (): string => {
	const bytes = new Uint8Array(5);
	crypto.getRandomValues(bytes);
	const code = encodeBase32UpperCaseNoPadding(bytes);
	return code;
};

export const generateRandomRecoveryCode = (): string => {
	const recoveryCodeBytes = new Uint8Array(10);
	crypto.getRandomValues(recoveryCodeBytes);
	const recoveryCode = encodeBase32UpperCaseNoPadding(recoveryCodeBytes);
	return recoveryCode;
};

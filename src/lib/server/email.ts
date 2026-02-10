import EmailTemplate from '$lib/components/email-template.svelte';

export const verifyEmailInput = (email: string): boolean => {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
};

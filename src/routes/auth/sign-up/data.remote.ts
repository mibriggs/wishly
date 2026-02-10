import { form } from '$app/server';
import { RESEND_SECRET_TOKEN } from '$env/static/private';
import EmailTemplate from '$lib/components/email-template.svelte';
import { signUpWithEmailSchema } from '$lib/schema';
import type { EmailVerifiationRequest, User } from '$lib/server/db/schema';
import { EmailVerificationService } from '$lib/server/db/services/email-verification.service';
import { UserService } from '$lib/server/db/services/user.service';
import { verifyEmailInput } from '$lib/server/email';
import { verifyPasswordStrength } from '$lib/server/password';
import { generateRandomOTP, verifyUsernameInput } from '$lib/server/user';
import { error } from '@sveltejs/kit';
import { Resend } from 'resend';
import { render } from 'svelte/server';

const resend = new Resend(RESEND_SECRET_TOKEN);
export const createUserFromEmail = form(
	signUpWithEmailSchema,
	async ({ username, email, password }) => {
		console.log(username, email, password);

		if (!verifyEmailInput(email)) error(400, { message: 'Invalid email' });

		const isEmailAvailable = await UserService.checkEmailAvailability(email);
		if (!isEmailAvailable) error(400, { message: 'Cannot use an email already in use' });

		const isValidUsername = verifyUsernameInput(username);
		if (isValidUsername !== undefined) error(400, { message: isValidUsername });

		const isStrongPassword = await verifyPasswordStrength(password);
		if (!isStrongPassword) error(400, { message: 'Weak password' });

		// Now create user from email;
		// const newUser: User = await UserService.createEmailUser(username, email, password);
		// const emailVerificationRequest: EmailVerifiationRequest =
		// 	await EmailVerificationService.createEmailVerificationRequest(
		// 		newUser.id,
		// 		newUser.email ?? ''
		// 	);
		const maybeEmailError = await sendVerificationEmail(username, email, generateRandomOTP());

		if (maybeEmailError) error(500, { message: JSON.stringify(maybeEmailError) });
	}
);

const sendVerificationEmail = async (username: string, email: string, code: string) => {
	const { error: resendError } = await resend.emails.send({
		from: 'noreply@verify.owanari.dev',
		to: email,
		subject: 'Welcome to Wantify!',
		html: generateVerificationEmail(username, code)
	});
	return resendError;
};

const generateVerificationEmail = (username: string, code: string) => {
	const { body } = render(EmailTemplate, {
		props: {
			username,
			code
		}
	});
	return body;
};

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
	return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>Verify your email</title>
<style>
	html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; }
	* { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
	table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
	table { border-spacing: 0 !important; border-collapse: collapse !important; margin: 0 auto !important; }
	div[style*="margin: 16px 0"] { margin: 0 !important; }
</style>
</head>
<body style="margin: 0; padding: 0; width: 100%; word-spacing: normal; background-color: #d4d0c8;">
${body}
</body>
</html>`;
};

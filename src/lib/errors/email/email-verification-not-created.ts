export class EmailVerificationNotCreated extends Error {
	constructor() {
		super(`Could not create email verification request`);
		this.name = 'EmailVerificationNotCreated';
	}
}

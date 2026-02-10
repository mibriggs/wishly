export class EmailVerificationNotDeleted extends Error {
	constructor() {
		super(`Could not delete email verification request`);
		this.name = 'EmailVerificationNotDeleted';
	}
}

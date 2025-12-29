export class UserNotCreatedError extends Error {
	constructor() {
		super('User could not be created');
		this.name = 'UserNotCreatedError';
	}
}

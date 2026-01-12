export class SessionNotCreatedError extends Error {
	constructor() {
		super(`Failed to create session`);
		this.name = 'SessionNotCreatedError';
	}
}

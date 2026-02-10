import { getSingleObjectOrNull, type ShareDuration } from '$lib';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { db } from '..';
import {
	type EmailVerifiationRequest,
	emailVerificationRequestTable,
	type SharedWishlist,
	sharedWishlistTable
} from '../schema';
import { generateRandomOTP } from '$lib/server/user';
import { EmailVerificationNotCreated } from '$lib/errors/email/email-verification-not-created';
import { EmailVerificationNotDeleted } from '$lib/errors/email/email-verification-not-deleted';

export class EmailVerificationService {
	constructor() {}

	/**
	 * Creates a new email verification request for a user.
	 *
	 * @param userId - The ID of the wishlist to share
	 * @param email - The expiration date for the share link
	 * @returns The created verification request object
	 * @throws {EmailVerificationNotCreated} If it fails to create a new email verification
	 */
	static async createEmailVerificationRequest(userId: string, email: string) {
		await this.deleteEmailVerificationRequest(userId);

		const code = generateRandomOTP();
		const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

		const verificationRequests = await db
			.insert(emailVerificationRequestTable)
			.values({ userId, email, code, expiresAt })
			.returning();

		if (verificationRequests.length === 0) throw new EmailVerificationNotCreated();

		return verificationRequests[0];
	}

	/**
	 * Creates a new email verification request for a user.
	 *
	 * @param userId - The ID of the wishlist to share
	 * @returns The deleted verification request object
	 * @throws {EmailVerificationNotDeleted} If it fails to delete a email verification
	 */
	static async deleteEmailVerificationRequest(userId: string) {
		const deleted: EmailVerifiationRequest[] = await db
			.delete(emailVerificationRequestTable)
			.where(eq(emailVerificationRequestTable.userId, userId))
			.returning();

		if (deleted.length === 0) throw new EmailVerificationNotDeleted();
		return deleted[0];
	}
}

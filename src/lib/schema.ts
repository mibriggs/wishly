import { z } from 'zod';

export const wishlistSchema = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	streetAddress: z.string().nullable(),
	city: z.string().nullable(),
	state: z.string().nullable(),
	zipCode: z.string().nullable(),
	isLocked: z.boolean(),
	isDeleted: z.boolean(),
	deletedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date()
});

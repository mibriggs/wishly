import { z } from 'zod';

export const uuidSchema = z.string().uuid();

// TODO: 2 digits after decimal point
const stringToNumberMinSchema = z
	.string()
	.superRefine((val, ctx) => {
		if (val.trim().length < 1) {
			ctx.addIssue({
				code: 'custom',
				message: 'Invalid price'
			});
			return;
		}

		const num = Number(val);
		if (isNaN(num)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Invalid price'
			});
			return;
		}
		if (num < 0) {
			ctx.addIssue({
				code: 'too_small',
				type: 'number',
				minimum: 0,
				inclusive: true,
				message: 'Cannot have a negative price'
			});
		}
	})
	.transform((val) => Number(val));

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

export const newItemSchema = z.object({
	wishlistId: z.string().uuid({ message: 'ID must be a UUID' }),
	itemName: z
		.string({ required_error: 'Name is required' })
		.trim()
		.min(1, { message: 'Name is required' }),
	itemUrl: z.string({ required_error: 'Url must be supplied' }).url(),
	itemQuantity: z.coerce
		.number({ required_error: 'Must have at least one item' })
		.min(1, { message: 'You must have at least one item' }),
	itemCost: z.union([
		z
			.number({ required_error: 'Price is required' })
			.min(0, { message: 'Cannot have a negative price' }),
		stringToNumberMinSchema
	])
});

export const deleteItemSchema = z.object({
	itemId: z.string().uuid(),
	wishlistId: z.string().uuid()
});

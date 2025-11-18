import { z } from 'zod';

export const uuidSchema = z.string().uuid();

const stringToNumberMinSchema = z
	.string()
	.superRefine((val, ctx) => {
		if (val.trim().length < 1) {
			ctx.addIssue({
				code: 'custom',
				message: 'Price cannot be empty'
			});
			return;
		}

		const num = Number(val);
		if (isNaN(num)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Must be numerical value'
			});
			return;
		}
		if (num <= 0) {
			ctx.addIssue({
				code: 'too_small',
				type: 'number',
				minimum: 0,
				inclusive: false,
				message: 'Price must be greater than $0'
			});
		}
	})
	.transform((val) => Math.round(Number(val) * 100) / 100);

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
		.number({ required_error: 'You must have at least one item' })
		.min(1, { message: 'You must have at least one item' }),
	itemCost: z.union([
		z
			.number({ required_error: 'Price is required' })
			.positive({ message: 'Price must be greater than $0' })
			.gt(0, { message: 'Price must be greater than $0' }),
		stringToNumberMinSchema
	])
});

export const updateItemSchema = newItemSchema.extend({
	itemId: z.string().uuid()
});

export const deleteItemSchema = z.object({
	itemId: z.string().uuid(),
	wishlistId: z.string().uuid()
});

export const githubUserSchema = z.object({
	id: z.number(),
	login: z.string()
});

export const discordUserSchema = z.object({
	id: z.string(),
	username: z.string()
});

export type DiscordUser = z.infer<typeof discordUserSchema>;
export type GithubUser = z.infer<typeof githubUserSchema>;
export type FormDataInput = {
	action: URL;
	formData: FormData;
	formElement: HTMLFormElement;
	controller: AbortController;
	submitter: HTMLElement | null;
	cancel: () => void;
};

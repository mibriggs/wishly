import { isNull, type InferSelectModel } from 'drizzle-orm';
import {
	boolean,
	decimal,
	index,
	integer,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar
} from 'drizzle-orm/pg-core';
import { u8bytea } from './custom-types';

export const userTable = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey().unique(),
		guestId: uuid('guest_id').unique(),
		isGuest: boolean('is_guest').default(false).notNull(),
		githubId: integer('github_id'),
		githubUsername: varchar('github_username', { length: 255 }),
		googleId: varchar('google_id', { length: 255 }),
		googleUsername: varchar('google_username', { length: 255 }),
		discordId: varchar('discord_id', { length: 255 }),
		discordUsername: varchar('discord_username', { length: 255 }),
		email: varchar('email', { length: 255 }),
		name: varchar('name', { length: 255 }),
		streetAddress: varchar('street_address', { length: 255 }),
		city: varchar('city', { length: 255 }),
		state: varchar('state', { length: 255 }),
		zipCode: integer('zip_code'),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow()
	},
	(table) => [
		index('discord_id_index').on(table.discordId),
		index('github_id_index').on(table.githubId)
	]
);

export const sessionTable = pgTable('sessions', {
	id: varchar('id', { length: 255 }).primaryKey().unique(),
	secretHash: u8bytea('secret_hash').notNull(),
	userId: uuid('user_id')
		.references(() => userTable.id)
		.notNull(),
	deletedAt: timestamp('deleted_at', { withTimezone: true, precision: 6 }),
	createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
	lastActivityAt: timestamp('last_activity_at', { withTimezone: true, precision: 6 })
		.notNull()
		.defaultNow()
});

export const wishlistTable = pgTable(
	'wishlists',
	{
		id: uuid('id').defaultRandom().primaryKey().unique(),
		userId: uuid('user_id')
			.references(() => userTable.id)
			.notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		streetAddress: varchar('street_address', { length: 255 }),
		city: varchar('city', { length: 255 }),
		state: varchar('state', { length: 255 }),
		zipCode: integer('zip_code'),
		isLocked: boolean('is_locked').default(false).notNull(),
		isDeleted: boolean('is_deleted').default(false).notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true, precision: 6 }),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, precision: 6 }).notNull().defaultNow()
	},
	(table) => [
		index('wishlist_to_user_id_index').on(table.userId),
		index('wishlist_is_deleted_index').on(table.isDeleted),
		index('wishlist_updated_at_index').on(table.updatedAt)
	]
);

// TODO: notes, sizes etc
// TODO: a way to claim or show intent of buying, lastly isBought? by who etc...
// TODO: a way to show if it has been claimed etc...
export const wishlistItemTable = pgTable(
	'wishlist_items',
	{
		id: uuid('id').defaultRandom().primaryKey().unique(),
		wishlistId: uuid('wishlist_id')
			.references(() => wishlistTable.id)
			.notNull(),
		itemName: varchar('item_name', { length: 255 }).notNull(),
		price: decimal('price', { precision: 10, scale: 2 }).notNull(),
		quantity: integer('quantity').default(1).notNull(),
		url: varchar('url', { length: 255 }).notNull(),
		imageUrl: varchar('image_url', { length: 255 }),
		isDeleted: boolean('is_deleted').default(false).notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true, precision: 6 }),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, precision: 6 }).notNull().defaultNow()
	},
	(table) => [
		index('items_to_wishlist_id_index').on(table.wishlistId),
		index('items_is_deleted_index').on(table.isDeleted)
	]
);

export const sharedWishlistTable = pgTable(
	'shared_wishlists',
	{
		id: uuid('id').defaultRandom().primaryKey().unique(),
		wishlistId: uuid('wishlist_id')
			.references(() => wishlistTable.id)
			.notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true, precision: 6 }),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, precision: 6 }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('one_null_date_per_fk').on(table.deletedAt).where(isNull(table.deletedAt)),
		index('shared_to_wishlist_id_index').on(table.wishlistId)
	]
);

export type WishlistItem = InferSelectModel<typeof wishlistItemTable>;
export type Wishlist = InferSelectModel<typeof wishlistTable>;
export type Session = InferSelectModel<typeof sessionTable>;
export type User = InferSelectModel<typeof userTable>;
export type SharedWishlist = InferSelectModel<typeof sharedWishlistTable>;

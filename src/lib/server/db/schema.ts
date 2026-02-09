import { type InferSelectModel } from 'drizzle-orm';
import {
	boolean,
	decimal,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core';
import { u8bytea } from './custom-types';

export const durationTypeEnum = pgEnum('share_duration', [
	'ONE_HOUR',
	'ONE_DAY',
	'SEVEN_DAYS',
	'FOURTEEN_DAYS',
	'THIRTY_DAYS',
	'NINETY_DAYS',
	'NEVER'
]);

export const userTable = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey().unique(),
		guestId: uuid('guest_id').unique(),
		isGuest: boolean('is_guest').default(false).notNull(),
		oauthId: varchar('oauth_id', { length: 255 }),
		username: varchar('username', { length: 255 }),
		email: varchar('email', { length: 255 }),
		passwordHash: text('password_hash'),
		emailVerified: boolean('email_verified').default(false).notNull(),
		totpKey: u8bytea('totp_key'),
		recoveryCode: u8bytea('recovery_code'),
		streetAddress: varchar('street_address', { length: 255 }),
		city: varchar('city', { length: 255 }),
		state: varchar('state', { length: 255 }),
		zipCode: integer('zip_code'),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow()
	},
	(table) => [index('oauth_id_index').on(table.oauthId), index('email_index').on(table.email)]
);

export const sessionTable = pgTable(
	'sessions',
	{
		id: varchar('id', { length: 255 }).primaryKey().unique(),
		secretHash: u8bytea('secret_hash').notNull(),
		userId: uuid('user_id')
			.references(() => userTable.id)
			.notNull(),
		twoFactorVerified: boolean('two_factor_verified').default(false).notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true, precision: 6 }),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
		lastActivityAt: timestamp('last_activity_at', { withTimezone: true, precision: 6 })
			.notNull()
			.defaultNow()
	},
	(table) => [index('session_user_id_deleted_at_index').on(table.userId, table.deletedAt)]
);

export const wishlistTable = pgTable(
	'wishlists',
	{
		id: uuid('id').defaultRandom().primaryKey().unique(),
		userId: uuid('user_id')
			.references(() => userTable.id)
			.notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		streetAddress: varchar('street_address', { length: 255 }),
		streetAddress2: varchar('street_address_2', { length: 255 }),
		city: varchar('city', { length: 255 }),
		state: varchar('state', { length: 255 }),
		zipCode: varchar('zip_code', { length: 20 }),
		isLocked: boolean('is_locked').default(false).notNull(),
		isDeleted: boolean('is_deleted').default(false).notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true, precision: 6 }),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, precision: 6 })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('wishlist_to_user_id_index').on(table.userId),
		index('wishlist_is_deleted_index').on(table.isDeleted),
		index('wishlist_updated_at_index').on(table.updatedAt),
		index('wishlist_user_deleted_updated_index').on(table.userId, table.isDeleted, table.updatedAt)
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
		updatedAt: timestamp('updated_at', { withTimezone: true, precision: 6 })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('items_to_wishlist_id_index').on(table.wishlistId),
		index('items_is_deleted_index').on(table.isDeleted),
		index('items_wishlist_deleted_index').on(table.wishlistId, table.isDeleted),
		index('items_id_wishlist_index').on(table.id, table.wishlistId)
	]
);

export const sharedWishlistTable = pgTable(
	'shared_wishlists',
	{
		id: uuid('id').defaultRandom().primaryKey().unique(),
		wishlistId: uuid('wishlist_id')
			.references(() => wishlistTable.id)
			.notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, precision: 6 })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		expiresAt: timestamp('expires_at', { withTimezone: true, precision: 6 }),
		durationType: durationTypeEnum('duration_type').notNull().default('THIRTY_DAYS')
	},
	(table) => [
		index('shared_to_wishlist_id_index').on(table.wishlistId),
		index('expires_at_index').on(table.expiresAt),
		index('shared_wishlist_expires_index').on(table.wishlistId, table.expiresAt)
	]
);

export type WishlistItem = InferSelectModel<typeof wishlistItemTable>;
export type Wishlist = InferSelectModel<typeof wishlistTable>;
export type Session = InferSelectModel<typeof sessionTable>;
export type User = InferSelectModel<typeof userTable>;
export type SharedWishlist = InferSelectModel<typeof sharedWishlistTable>;

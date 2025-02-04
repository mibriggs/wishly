import { decimal, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: varchar('email', { length: 255 }),
	name: varchar('name', { length: 255 }),
	streetAddress: varchar('streetAddress', { length: 255 }),
	city: varchar('city', { length: 255 }),
	state: varchar('state', { length: 255 }),
	zipCode: integer('zipcode')
});

export const wishlist = pgTable('wishlists', {
	id: uuid('id').defaultRandom().primaryKey(),

});

export const wishlistItem = pgTable('wishlistItems', {
	id: uuid('id').defaultRandom().primaryKey(),
	itemName: varchar('itemName', { length: 255 }).notNull(),
	price: decimal('price', { scale: 2}).notNull(),
	quantity: integer('quantity').default(1).notNull(),
	url: varchar('url', { length: 255 }).notNull(),
});
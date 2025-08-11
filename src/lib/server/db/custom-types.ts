import { customType } from 'drizzle-orm/pg-core';

export const u8bytea = customType<{
	data: Uint8Array;
	driverData: Buffer;
	notNull: false;
	default: false;
}>({
	dataType() {
		return 'bytea';
	},
	toDriver(buffer) {
		// app -> db
		return Buffer.from(buffer);
	},
	fromDriver(value) {
		// db -> app
		if (typeof value === 'object' && value instanceof Uint8Array) {
			return new Uint8Array(value);
		}
		throw new Error('Expected Uint8Array');
	}
});

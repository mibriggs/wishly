import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { durationSchema } from '$lib/schema';
import type { ShareDuration } from '$lib';
import { SharedWishlistService } from '$lib/server/db/services/shared.service';

const patchBodySchema = z.object({
	newDuration: durationSchema
});

function calculateExpiry(duration: ShareDuration): Date | null {
	const ms: number | null = {
		ONE_HOUR: 1000 * 60 * 60,
		ONE_DAY: 1000 * 60 * 60 * 24,
		SEVEN_DAYS: 1000 * 60 * 60 * 24 * 7,
		FOURTEEN_DAYS: 1000 * 60 * 60 * 24 * 14,
		THIRTY_DAYS: 1000 * 60 * 60 * 24 * 30,
		NINETY_DAYS: 1000 * 60 * 60 * 24 * 90,
		NEVER: null
	}[duration];

	if (ms !== null) {
		return new Date(Date.now() + ms);
	}
	return null;
}

export const PATCH: RequestHandler = async ({ request, params }) => {
	const body = await request.json();
	const maybeBodyData = patchBodySchema.safeParse(body);

	if (maybeBodyData.success) {
		const duration: ShareDuration = maybeBodyData.data.newDuration;
		const shareId: string = params.shareId;
		const newDate = calculateExpiry(duration);

		const updatedShared = SharedWishlistService.updateExpiration(shareId, newDate, duration);

		if (updatedShared !== null) {
			return json({ success: true }, { status: 200 });
		}
		return new Response(null, { status: 400 });
	}

	return new Response(null, { status: 400 });
};

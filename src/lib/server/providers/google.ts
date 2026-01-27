import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URL } from '$env/static/private';
import { Google } from 'arctic';

const redirectUrl = `${REDIRECT_URL}/google/callback`;
export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUrl);

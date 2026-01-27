import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, REDIRECT_URL } from '$env/static/private';
import { GitHub } from 'arctic';

const redirectUrl = `${REDIRECT_URL}/github/callback`;
export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, redirectUrl);

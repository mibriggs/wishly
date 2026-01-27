import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, REDIRECT_URL } from '$env/static/private';
import { Discord } from 'arctic';

const redirectUrl = `${REDIRECT_URL}/discord/callback`;
export const discord = new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, redirectUrl);

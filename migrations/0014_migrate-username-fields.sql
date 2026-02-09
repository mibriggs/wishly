-- Custom SQL migration file, put your code below! --
UPDATE users
SET username = COALESCE(github_username, google_username, discord_username)
WHERE github_username IS NOT NULL OR google_username IS NOT NULL OR discord_username IS NOT NULL;

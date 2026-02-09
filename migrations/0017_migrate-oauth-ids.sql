-- Custom SQL migration file, put your code below! --
UPDATE users
SET oauth_id = COALESCE(
    github_id::VARCHAR(255),  -- Cast integer to varchar
    google_id,
    discord_id
)
WHERE github_id IS NOT NULL
   OR google_id IS NOT NULL
   OR discord_id IS NOT NULL;

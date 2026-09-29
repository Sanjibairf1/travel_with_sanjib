# Automation changes

- Sky Challenge publishes 10 questions per India-local day. The next day advances to the next block of 10 topics.
- Challenge UI, scoring and sharing now use 10 questions / 100 maximum points.
- Flight Chronicles automation publishes only a full story every third day; daily fact posts are disabled.
- Story posts are enriched automatically with up to three Wikimedia Commons search images when available, with curated fallback visuals.
- Aviation News now attempts RSS/GDELT image metadata first, then the original article Open Graph/Twitter image, then an aviation-category fallback so cards do not render with a missing image.
- Daily automation no longer stops after 90 days.
- Existing Vercel daily cron remains the trigger; no routine manual upload is required after deployment/configuration.

Important: the bundled Chronicle source currently contains four fully researched historical stories and rotates them. For indefinitely *new* long-form stories, a trusted external content-generation/research source must be connected; the app should not invent factual aviation history.


## Account UX
- Signed-in users now see a simple Profile screen with their existing display name/email and a Sign out button.
- Removed the repeated leaderboard-name edit form from the normal account page.
- Quiz scores and leaderboard activity continue to save automatically while signed in.

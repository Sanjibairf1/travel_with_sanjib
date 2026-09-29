# Travel With Sanjib

Mobile-first aviation companion built with Next.js App Router, TypeScript, Tailwind CSS, and a Supabase-ready backend. It is deliberately a strong Phase 1 MVP: all main surfaces work with realistic local demo data before any external automation is connected.

## Included

- Premium mobile-first home, bottom navigation, daily Sky Challenge, public leaderboard, Flight Chronicles, Aviation News, admin dashboard and clickable analytics page.
- Timed ten-question daily quiz experience with feedback, explanations, replay state, scoring, and guest-to-account save prompt.
- Full Supabase migration with the requested tables, RLS, role guard function, settings defaults, moderation/reporting entities, news updates and suspensions.
- Configurable settings model for timezone, schedules, scoring, approval windows, moderation, maintenance and automation state. Chronicle default is 19:00 `Asia/Kolkata`.
- Daily quiz, Chronicle scheduling, and sourced-news collection are implemented through protected cron routes. Production still requires the documented Supabase tables/settings and Vercel environment variables.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Demo UI requires no environment variables. For a database-backed deployment, create a Supabase project, fill `.env.local`, and apply `supabase/migrations/202608290001_initial_schema.sql` with the Supabase CLI or SQL editor.

```bash
supabase db push
npm run build
```

## Supabase and auth hardening

1. Enable Email/Password in Supabase Auth and configure your production site URL/redirect URLs.
2. Create a profile automatically after sign-up (recommended trigger) and manually grant initial trusted staff an `admin`, `editor`, or `moderator` role. The role is checked by `public.is_admin()` in RLS.
3. Add server-side auth middleware before deploying the `/admin` route. The included page is a visual scaffold so it remains testable with demo data; it is not an authorization implementation by itself.
4. Require MFA/2FA for staff in Supabase Auth before production. Never put `SUPABASE_SERVICE_ROLE_KEY` in client code or a `NEXT_PUBLIC_` variable.
5. Guest quiz sessions should use a random client token, then be securely claimed after sign-in by a server route/function. Only first completed sessions should create leaderboard points.

## Automation architecture (scaffolded)

Use a protected Vercel Cron route, Edge Function, or separate worker for ingestion. It should use the service role key only server-side, store every candidate as `draft`/`review`, deduplicate by canonical original URL, and add new facts to `news_updates` instead of duplicating a developing article.

- Incident candidates create `admin_notifications` and a `review_deadline` one hour out.
- On deadline, publish only when configured verification rules pass; otherwise reject and select another candidate.
- Normal automation honours `app_settings` and may be paused at any time.
- Do not treat Instagram as authentication until an official supported OAuth/API flow is configured and reviewed.

## Backups and restores

Schedule daily Supabase backups/PITR according to the chosen Supabase plan, export critical editorial data to versioned encrypted storage, and audit every restore request. A restore must be a manually approved runbook: snapshot current data, choose an exact restore point, test in a non-production project, require two admin confirmations, then execute with maintenance mode enabled. There is deliberately no one-click destructive restore implementation.

## Deployment

Push to a Git provider and import into Vercel. Add the variables from `.env.example` in Vercel Project Settings, set the production auth URLs in Supabase, apply the migration, then run the build command. Add a custom logo by replacing the plane mark in `components/app-header.tsx` and `app/admin/login/page.tsx`.

## Production checks remaining

Before public production launch, verify the live Supabase schema and constraints against the 10-question format, confirm leaderboard scoring accepts the wider score range, and test the protected cron routes with Vercel environment variables. News uses sourced links and image fallbacks. Long-form Chronicles currently rotate a curated, researched story library; adding genuinely new verified stories indefinitely requires a trusted research/generation source rather than inventing historical events.

## Instagram / Flight Deck tracking
Use `/?src=instagram` as the Instagram bio destination and `/challenge?src=flightdeck` for Sky Challenge links posted in The Flight Deck. The admin Analytics page counts website visits, challenge views, starts, completions, shares, and these source-tagged visits through the existing `analytics_events` table.

<!-- Vercel Git integration check: 2026-09-30 -->

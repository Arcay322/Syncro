<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Syncro — Project Context

## Overview
A minimalist Apple-style web app to track movies and TV series progress. Supports both personal lists and shared group rooms. Deployed on Vercel.

## Tech Stack
- **Framework:** Next.js 15/16 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (base-nova, neutral theme)
- **Database:** Supabase (PostgreSQL) + Prisma 5 ORM
- **Auth:** Auth.js (NextAuth v5) with Google OAuth + Prisma Adapter
- **Animations:** Framer Motion
- **External Data:** TMDB API
- **Icons:** Lucide React

## Database Schema (Prisma)
- `User` / `Account` / `Session` / `VerificationToken` — NextAuth models
- `Group` — Shared room with `inviteCode` (6-char random hex)
- `GroupMember` — Junction table (role: owner | member)
- `WatchlistItem` — Can belong to a `userId` (personal) or `groupId` (shared)
  - Fields: tmdbId, mediaType, title, posterPath, backdropPath, status, rating, notes, currentSeason, currentEpisode, currentMinute

## Architecture Decisions
- **Prisma 5** is used (not v7) to avoid breaking constructor changes.
- **NextAuth v5** (`next-auth@beta`) with `auth.ts` pattern.
- **No `src/` directory.** All code is at project root.
- **Server Components** for data fetching where possible; **Client Components** for interactivity.
- **API Routes** proxy TMDB calls to avoid exposing API keys client-side.

## Key Files & Patterns
- `auth.ts` — NextAuth configuration. Export: `handlers, auth, signIn, signOut`.
- `lib/prisma.ts` — Singleton PrismaClient.
- `lib/tmdb.ts` — TMDB helpers and image URL builder.
- `middleware.ts` — Auth protection (excludes `/login`, `/api`, static files).
- `app/api/auth/[...nextauth]/route.ts` — Auth.js HTTP handler.
- `app/api/search/route.ts` — Proxies TMDB multi-search.
- `app/api/watchlist/route.ts` — GET/POST watchlist items.
- `app/api/watchlist/[id]/route.ts` — PATCH/DELETE with ownership checks.
- `app/api/groups/route.ts` — GET my group, POST create group.
- `app/api/groups/join/route.ts` — POST join by invite code.
- `app/api/tmdb/season/route.ts` — Proxy for TV season episodes.

## UI Components (Custom)
- `components/dashboard.tsx` — Main dashboard with personal/group toggle.
- `components/watchlist-card.tsx` — Card with poster, status badge, progress snippet.
- `components/search-command.tsx` — ⌘+K Spotlight-style TMDB search.
- `components/group-manager.tsx` — Create/join shared room UI.
- `components/status-filter.tsx` — Animated pill filter bar.
- `components/detail-view.tsx` — Detail page with progress, rating, notes.

## State & Logic
- **Personal vs Group mode:** Toggle in Dashboard switches `?groupId=` param in API calls.
- **Progress tracking:**
  - TV: Season + Episode + Minute
  - Movie: Minute only
  - "Next episode" button auto-increments episode/season.
- **Rating:** 1–10 stars.
- **Group constraints:** One group per user max. Owner can delete items; any member can update progress.

## Environment Variables
```
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...:5432/postgres
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TMDB_API_KEY=...
```

## Deployment Notes
- Build command: `npm run build`
- Output: `.next/` (standard Next.js)
- Prisma generate must run before build.
- Images served from `image.tmdb.org` (configured in `next.config.ts`).

## Known Warnings
- `middleware.ts` is deprecated in Next.js 16 in favor of `proxy.ts`, but still functional.
- Some shadcn/ui components (`DropdownMenuTrigger`) do not support `asChild` prop in this registry version; use wrapper `div` instead.

## Commands
```bash
npm install
npx prisma generate
npm run dev
```

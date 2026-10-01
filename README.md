# NatureMe

The home of nature audio, mapped to where you are. One web app with two views: the Listener view, and the Creator view (the Studio at `/studio`).

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your Google Maps API key
npm run dev
```

Open http://localhost:3000. Without a key, the Map page shows a note instead of the map.

## What's here

- **Welcome** (`app/welcome`): first-run onboarding for interests, formats, location and calendar. Choices are kept in the browser (`lib/preferences.ts`) until accounts exist.
- **Home** (`app/page.tsx`): the calendar-gap card, pieces pinned near you, For you (from onboarding), Top Picks this week, the three ways of seeing nature, and the six formats.
- **Explore** (`app/explore`): Schools of thought, Cultures and Faiths, filterable by format.
- **Map** (`app/map`): Google Maps with place-pinned audio, near you or on a trip.
- **Companion** (`app/companion`): finds a free stretch in your calendar, picks a pinned place you can walk to, and logs the minutes each creator earned.

The catalogue in `lib/content.ts` is sample content. There are no audio files yet, so the player simulates playback at 10x speed. The Companion reads a sample calendar through the `CalendarSource` interface in `lib/calendar.ts`; Google Calendar plugs in there.

## Creator view: the Studio

- **Dashboard** (`app/studio/page.tsx`): published count, plays, minutes listened and per-minute earnings (sample rate in `lib/studio.ts`), and every upload with Play, Edit, Publish/Unpublish and Delete.
- **Upload** (`app/studio/upload`): pick an audio file, add title, description, format and Explore tags, pin it to a place (suggested from the words you type or a pasted transcript), then automated checks decide whether it can go live.
- **Podcast feed** (`app/studio/import`): paste an RSS feed; `app/api/feed/route.ts` fetches it server-side, and each episode is auto-pinned to the places its notes mention.
- **Profile** (`app/studio/profile`): the creator name shown as “By …” to listeners.

Published uploads appear in the Listener view: in Explore (New from creators, and under the traditions they're tagged with), on the Map at their place, and in the player with real audio. Listening minutes are credited to the upload.

There is no backend yet. Uploads (including audio files) live in the browser's IndexedDB and the profile and listening totals in localStorage (`components/useStudio.ts`), so a creator's uploads are only visible in the browser they were made in. Making this real needs: creator accounts, file storage for audio (e.g. S3 or Vercel Blob), a database for pieces and places, server-side listen counting and payouts, AI moderation of the audio itself, speech-to-text transcripts for better place matching, and creators pinning brand-new places.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

# NatureMe

The home of nature audio, mapped to where you are. This is the Listener web app.

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
- **Profile** (`app/profile`): listening stats, your interests, location, and the Companion switch. It replaces the Companion tab.
- **Companion** (`app/companion`, opened from Profile or the Home card): finds a free stretch in your calendar, picks a pinned place you can walk to, and logs the minutes each creator earned.

The catalogue in `lib/content.ts` is sample content. There are no audio files yet, so the player simulates playback at 10x speed. The Companion reads a sample calendar through the `CalendarSource` interface in `lib/calendar.ts`; Google Calendar plugs in there.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

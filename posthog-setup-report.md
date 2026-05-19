<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the cisum Next.js App Router project. Here is a summary of all changes made:

- **`instrumentation-client.ts`** — Client-side PostHog initialization using the EU host and a reverse proxy (`/ingest`). Configured with `capture_exceptions: true` for automatic error tracking and `defaults: '2026-01-30'`. Uses `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` env variable.
- **`next.config.ts`** — EU reverse proxy rewrites (`/ingest/static/*`, `/ingest/array/*`, `/ingest/*`) and `skipTrailingSlashRedirect: true` ensure reliable event delivery.
- **`src/lib/posthog-server.ts`** — Server-side PostHog singleton using `posthog-node`. Added `shutdownPostHog()` export for clean teardown.
- **`src/components/PostHogIdentify.tsx`** (new) — Client component using Clerk's `useUser()` hook to call `posthog.identify()` whenever a user signs in, and `posthog.reset()` on sign-out.
- **`src/app/layout.tsx`** — Added `<PostHogIdentify />` inside `<ClerkProvider>` for automatic user identification across all pages.
- **`src/components/Navbar.tsx`** — Added `documentation_clicked` and `discord_link_clicked` capture to the navbar links.
- **`src/hooks/useWasmSdk.ts`** — Added `wasm_engine_initialized` capture on successful WASM boot and `posthog.captureException()` on failure for error tracking.
- **`.env.local`** — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` set to correct EU values (covered by `.gitignore`).

Previously instrumented events in `src/app/page.tsx`, `src/app/downloads/page.tsx`, and `src/app/play/page.tsx` were preserved and supplemented.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `hero_download_clicked` | User clicked "Download App" in the hero section | `src/app/page.tsx` |
| `web_player_opened` | User clicked "Open Web Player" on the hero section | `src/app/page.tsx` |
| `cta_download_clicked` | User clicked "Download App" in the closing CTA section | `src/app/page.tsx` |
| `download_clicked` | User clicked the primary "Download Now" button on the downloads page | `src/app/downloads/page.tsx` |
| `platform_download_clicked` | User clicked a platform-specific download in the "All Platforms" grid | `src/app/downloads/page.tsx` |
| `track_played` | User plays a track in the web player (includes title, artist, provider) | `src/app/play/page.tsx` |
| `music_searched` | User submitted a music search query in the web player | `src/app/play/page.tsx` |
| `play_all_clicked` | User clicked "Play All" for the current artist | `src/app/play/page.tsx` |
| `shuffle_clicked` | User clicked "Shuffle" for the current artist | `src/app/play/page.tsx` |
| `artist_favorited` | User toggled favorite on an artist | `src/app/play/page.tsx` |
| `playlist_selected` | User selected a playlist from the sidebar | `src/app/play/page.tsx` |
| `latest_release_played` | User clicked the latest release album card | `src/app/play/page.tsx` |
| `documentation_clicked` | User clicked the Documentation link in the navbar | `src/components/Navbar.tsx` |
| `discord_link_clicked` | User clicked the Discord link in the navbar | `src/components/Navbar.tsx` |
| `wasm_engine_initialized` | Swift WASM engine successfully initialized in the web player | `src/hooks/useWasmSdk.ts` |
| `wasm_engine_failed` | Swift WASM engine failed to boot (captured as exception) | `src/hooks/useWasmSdk.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/689479)
- [Download Conversion Funnel](/insights/HzA8x2Wp) — Drop-off between clicking the hero CTA and completing the actual download
- [Downloads Over Time](/insights/Hqqsq8b1) — Primary and platform-specific download clicks over time
- [Web Player: Unique Listeners](/insights/ljBguK6U) — Daily active listeners in the web player
- [Music Search Volume](/insights/1Ke1dLK0) — Total music searches in the web player over time
- [Landing Page CTAs](/insights/FvzTi5gR) — Clicks on hero download, web player, and closing CTA buttons compared

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

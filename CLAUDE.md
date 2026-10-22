# Second Look

A private CBT (cognitive behavioral therapy) thought journal. Users catch an automatic thought, rate their feelings, name thinking traps, weigh evidence, write a balanced thought, and re-rate. The app also has a daily mood check-in with a trend chart, a guided breathing circle, and a codex of thinking traps with a practice quiz.

## Commands

```bash
npm install       # once
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check (tsc -b) + production build to dist/
npm run lint      # oxlint
npm run preview   # serve dist/ (the service worker only registers in production)
```

There is no test suite. A change is done when `npm run build` and `npm run lint` are both clean.

## Stack

Vite + React 19 + TypeScript (strict: `noUnusedLocals`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, so no enums or parameter properties). Tailwind CSS v4 via `@tailwindcss/vite`. `react-router-dom` with **HashRouter**, so it runs on any static host without rewrites. `lucide-react` for icons. Fonts are self-hosted through `@fontsource-variable/*`.

## Hard rules

- **No AI and no network calls.** The product decision was to remove the AI coach entirely. Don't add fetches, analytics, CDNs or external fonts. Everything a user writes stays in their browser.
- **Local-first storage only.** All data is in `localStorage` under `secondlook:*` keys. Don't rename keys, because existing users would lose their data.
- **Treat stored and imported data as untrusted.** Every read goes through `normalizeRecord` / `normalizeCheckIn` in `src/lib/storage.ts`. Add new fields there with defaults, and never assume a field exists.
- **No seed or fake data.** The journal and the mood chart start empty and show empty states.
- **Don't bias ratings.** Nothing starts preselected (emotions, distortions). Re-rate sliders start at the user's "before" values, never at a lowered default.
- **Keep the crisis support reachable**: the header Support button, the footer link, and the inline `CrisisNote` that appears when any emotion is rated 90 or higher. Phone numbers in `src/data/prompts.ts` must stay accurate.
- **No unverifiable claims.** That means no "encrypted" or "HIPAA compliant" wording and no attributed quotes unless the source is verified.

## Layout

```
src/
  App.tsx              routes: / /studio /journal /breathe /codex
  types.ts             ThoughtRecord, CheckIn, DistortionDefinition
  data/                static content: distortions (+ quiz scenarios), prompts, crisis lines, breathing patterns
  lib/storage.ts       persisted list stores (useSyncExternalStore), import/export, CSV, draft key
  lib/ui.ts            in-memory app state: which dialog is open, toasts
  lib/metrics.ts       relief %, distortion counts, date formatting, `meta()` interpunct joiner
  lib/audio.ts         Web Audio singing-bowl tone (opt-in only)
  components/          Layout (header, phone tab bar, dialogs, toaster), Dialog (native <dialog>), BreathOrb, MoodChart, Slider, …
  pages/               Home, Studio (the 7-step reframe flow), Journal, Breathe, Codex
public/sw.js           offline cache for the static shell
```

The Studio draft autosaves to `secondlook:draft`, and `/studio?d=<distortionId>` preselects a trap. The journal's `deleteRecord` returns an undo function, which is used by the toast.

## Styling conventions

- Colors are CSS variables in `src/index.css` (`--canvas`, `--surface`, `--line`, `--ink`, `--muted`, `--sage`, `--sage-wash`, `--ochre`, `--danger`), with a dark-mode block under `prefers-color-scheme`. They are exposed to Tailwind through `@theme inline` (`bg-surface`, `text-muted`, `border-line`, …). Use the tokens, never raw hex, so dark mode keeps working.
- Shared classes live in `@layer components`: `card`, `btn-primary`, `btn-quiet`, `btn-text`, `field`, `label`, `hint`, `num`. Utilities already override the components layer, so don't use `!` important modifiers.
- Body text is 15–16px and touch targets are at least 44px (`min-h-11`). Don't go back to 11–12px UI text.
- Metadata is joined with interpuncts via `meta()` (`Oct 22 · Mind Reading · 57% relief`). Don't use pill badges.
- Respect `prefers-reduced-motion`. The orb, dialog and toast animations already do.

## Visual check

With no browser automation configured, screenshot the production build with headless Chrome:

```bash
npx vite preview --port 4317 &
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --hide-scrollbars \
  --window-size=1280,1600 --virtual-time-budget=4000 --screenshot=out.png "http://localhost:4317/#/journal"
```

Chrome won't go narrower than about 500px, so to check phone width, load the app inside a 390px-wide `<iframe>` on a page served from the same origin. Add `--force-dark-mode --blink-settings=preferredColorScheme=0` to check dark mode.

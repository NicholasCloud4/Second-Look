# Second Look

A private thought journal based on cognitive behavioral therapy (CBT). When a thought is pulling you under, Second Look helps you slow it down, test it against the evidence, and write a fairer version.

## Features

- **Reframe a thought.** A guided 7-step flow: settle, catch the thought, rate your feelings, name the thinking traps, weigh the evidence, write a balanced thought, and re-rate. Progress autosaves.
- **Daily check-in.** Log mood, energy and a few words about your day, then see the trend over 7, 14 or 30 days.
- **Breathe.** A guided breathing circle with four rhythms (4-7-8, box, physiological sigh, 5-5).
- **Thinking traps codex.** Eleven common cognitive distortions, each with an example, a question to ask yourself and what helps, plus a short practice quiz.
- **Journal.** Search and filter past reframes, see which traps come up most, and export to CSV (for a therapist) or a JSON backup.

## Privacy

Everything you write stays in your browser's local storage. Nothing is sent to a server, and there are no accounts or analytics. Clearing your browser data erases your entries, so use **Journal → Backup** now and then.

Second Look is a self-help tool, not a replacement for professional care. If you are in crisis, use the **Support** button in the app or contact your local emergency number.

## Running locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open http://localhost:5173. Run `npm run build` to create a static build in `dist/` that can be hosted anywhere.

## Built with

React 19, TypeScript, Vite, Tailwind CSS v4, React Router and Lucide icons.

## License

MIT. See [LICENSE](LICENSE).

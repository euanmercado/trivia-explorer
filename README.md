# Quiz Deck — Trivia Explorer

A small full-stack-in-the-browser web app for the Free API Niche Challenge (Trivia niche). It fetches live trivia questions from the **Open Trivia Database (OpenTDB)** API and displays them as a browsable "deck" of cards, filterable by category and difficulty.

## What the API does

[OpenTDB](https://opentdb.com) is a free, community-maintained trivia question database. This app uses two endpoints:

- `GET https://opentdb.com/api_category.php` — returns the list of all trivia categories, used to populate the category dropdown.
- `GET https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple` — returns a set of random multiple-choice trivia questions matching the given filters.

## Interactive feature

Users can filter the deck by **category**, **difficulty**, and **number of questions**, then click "Draw cards" to fetch a new set. Clicking any card flips it open to reveal the multiple-choice answers, with the correct one highlighted.

## API key handling

**No API key is required.** OpenTDB is a fully open, keyless public API, and it allows direct requests from the browser (no CORS proxy or backend needed). Because of this, there is nothing to hide, no `.env` file, and no serverless function in this project — all requests are made client-side with the Fetch API.

## Running locally

This is a static site (HTML/CSS/JS only), so no build step or dependencies are needed.

1. Clone the repo:
   ```
   git clone <your-repo-url>
   cd trivia-explorer
   ```
2. Open `index.html` directly in a browser, **or** serve it locally (recommended, avoids any local file/CORS quirks):
   ```
   npx serve .
   ```
   or, with Python:
   ```
   python3 -m http.server 8000
   ```
3. Visit `http://localhost:8000` (or whichever port your tool prints).

## Deploying

This app can be deployed to any static host (Netlify, Vercel, GitHub Pages, etc.) with zero configuration — just point the host at this folder. No environment variables are needed since there's no API key.

**Netlify (drag-and-drop or CLI):**
```
netlify deploy --prod
```

## Notes / known limits

- OpenTDB occasionally returns `response_code: 1` when a very narrow category + difficulty combination doesn't have enough questions available — the app shows a friendly message in that case rather than failing silently.
- Trivia content is provided by OpenTDB under a CC BY-SA 4.0 license.

## Files

- `index.html` — page structure and controls
- `style.css` — visual styling
- `script.js` — fetch logic, rendering, and interactivity
# Sabbatical Itinerary Website

A responsive SvelteKit website showcasing a sabbatical itinerary with the ability for visitors to express interest in joining specific trips.

## Features

- Responsive 12-column grid layout
- Beautiful destination cards with images
- Modal form for trip interest submission
- Backend-agnostic submission endpoint (example Airtable integration documented)
- Smooth animations and transitions
- Mobile-optimized bottom sheet modal

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up a submission backend:
   - The frontend posts `{ name, destinations[] }` to a single HTTPS endpoint.
   - You can back this endpoint with Airtable, another database, or any service you prefer.
   - See `AIRTABLE_SETUP.md` for a worked example using Airtable and a small backend function.

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your submission endpoint URL:
     ```bash
     PUBLIC_SUBMISSION_ENDPOINT=https://your-backend.example.com/submit
     ```

## Development

Run the development server:
```bash
npm run dev
```

## Building for GitHub Pages

The project is configured for GitHub Pages deployment in a subdirectory (`/recharge`).

### Quick Deploy

Simply run:
```bash
npm run deploy
```

This script will:
1. Build your project
2. Copy files to the `gh-pages` branch
3. Commit and push to GitHub

Your site will be live at: `https://thelittlewonder.github.io/recharge/`

### Manual Build

If you prefer to build manually:

1. Build the project:
```bash
npm run build
```

2. The static files will be in the `build/` directory.

3. Manually push the `build/` directory contents to the `gh-pages` branch

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── DestinationCard.svelte
│   │   ├── JoinModal.svelte
│   │   └── SoutheastAsiaMap.svelte
│   ├── data/
│   │   ├── itinerary.ts
│   │   └── destinations.ts
│   └── utils/
│       └── airtable.ts
├── routes/
│   ├── +layout.svelte
│   └── +page.svelte
├── app.html
└── app.css
static/
└── images/
    └── (add destination images here)
```

## Adding Images

Add destination images to `static/images/` with the following names:
- `taiwan.jpg`
- `kinabatangan.jpg`
- `yogyakarta.jpg`
- `bromo.jpg`
- `komodo.jpg`
- `bali.jpg`

## Technologies

- SvelteKit
- TypeScript
- Leaflet
- Airtable (via external backend endpoint, example provided)
- CSS Grid
- Google Fonts (Crimson Pro, Google Sans Flex)


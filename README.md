# Brads Handy Dandy Fitting Tool

A minimal GitHub Pages fitting tool with animated search flow.

## How this version works
- App opens with a centered search card.
- Enter Width + Height (Depth optional), then click **Search Fits**.
- Results animate in and only show:
  - **Green** = best fit (very tight tolerance),
  - **Yellow** = very close fit (small fraction difference).
- Disable **Show very close fits** to display only true-fit (green) models.
- Results intentionally show minimal info: **Model Number + Brand** plus fit delta.

## Better search behavior
- Keyword search matches model number, brand, category, and install notes.
- Sort options: best fit score, model number, or brand.
- Toggles: Active-only and Confirmed-only.

## Progress bar
- Shows:
  - total models added,
  - total confirmed models,
  - percentage confirmed.
- Confirmation is driven by each model's `infoConfirmed` boolean.

## Expansion packs / backend editing
### Option A (easiest): Import inside the UI
1. Open **Admin / Data**.
2. Click **Import Expansion Pack**.
3. Drag and drop a `.json` file, choose a file, or paste JSON text.
4. Click **Import**.

### Option B: Commit data in code
- Edit `defaultModels` in `app.js` and push to GitHub.
- Useful for shared, version-controlled seed data.

## GitHub Pages setup
1. Push this repository to GitHub.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select your branch and root folder.
4. Save and open the generated Pages URL.

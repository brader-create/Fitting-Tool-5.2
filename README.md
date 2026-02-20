# Brads Handy Dandy Fitting Tool

A minimal GitHub Pages fitting tool with animated search flow.

## How this version works
- App opens with a centered search card.
- Enter **Width + Depth** (Height optional), then click **Search Fits**.
- Click **Manual Browse** to open simple browsing mode without strict fit matching.
- Results only show compact data: **Model Number + Brand**.
- Green rows are fit matches, yellow rows are very close matches.

## Top bar behavior
- Title includes a fitting-tool icon and is clickable to return to the home/start state.
- Top center always shows how many models are available to search.
- Theme button now explicitly says **Dark Mode** or **Light Mode**.

## Progress bar
- Shows total models, confirmed models, and percentage confirmed.
- Confirmation uses each model's `infoConfirmed` field.

## Expansion packs and shared data
- Importing JSON in the UI saves to browser `localStorage` for that browser/device.
- That means it is not globally shared for all users by default.
- For shared team data, either:
  1) commit seed models in `app.js`, or
  2) move model storage to hosted JSON/API.

## GitHub Pages setup
1. Push this repository to GitHub.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select your branch and root folder.
4. Save and open the generated Pages URL.

## If your pull request shows conflicts
> Note: during **rebase**, use `--theirs` to keep this branch's file versions.
Use this branch-safe flow to rebase and resolve quickly:

```bash
git fetch origin main
./scripts/resolve-pr-conflicts.sh origin main
```

If conflicts appear in UI files, keep the latest tool UI from this branch:

```bash
git checkout --theirs index.html app.js styles.css README.md
git add index.html app.js styles.css README.md
git rebase --continue
git push --force-with-lease
```


#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${1:-main}"
WORK_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if ! git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
  echo "Target branch '$TARGET_BRANCH' not found locally. Fetch it first:"
  echo "  git fetch origin $TARGET_BRANCH:$TARGET_BRANCH"
  exit 1
fi

echo "Rebasing $WORK_BRANCH onto $TARGET_BRANCH..."
git rebase "$TARGET_BRANCH"

echo "If conflicts appear in UI files, keep the branch's latest tool UI version:"
echo "  git checkout --ours index.html app.js styles.css README.md"
echo "  git add index.html app.js styles.css README.md"
echo "  git rebase --continue"

echo "Done. Push with:"
echo "  git push --force-with-lease"

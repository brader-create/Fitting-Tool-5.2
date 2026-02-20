#!/usr/bin/env bash
set -euo pipefail

TARGET_REMOTE="${1:-origin}"
TARGET_BRANCH="${2:-main}"
WORK_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if ! git remote get-url "$TARGET_REMOTE" >/dev/null 2>&1; then
  echo "Remote '$TARGET_REMOTE' is not configured."
  echo "Add it first, e.g.: git remote add $TARGET_REMOTE <repo-url>"
  exit 1
fi

echo "Fetching $TARGET_REMOTE/$TARGET_BRANCH..."
git fetch "$TARGET_REMOTE" "$TARGET_BRANCH"

echo "Attempting automatic conflict minimization via rebase strategy..."
echo "Rebasing $WORK_BRANCH onto $TARGET_REMOTE/$TARGET_BRANCH with '-X theirs'"
set +e
git rebase "$TARGET_REMOTE/$TARGET_BRANCH" -X theirs --rebase-merges --autostash
REBASE_STATUS=$?
set -e

if [[ $REBASE_STATUS -ne 0 ]]; then
  echo
  echo "Conflicts remain. Resolve all remaining files with:"
  echo "  git status --short"
  echo
  echo "For UI files, keep THIS branch versions (during rebase => --theirs):"
  echo "  git checkout --theirs index.html app.js styles.css README.md"
  echo "  git add index.html app.js styles.css README.md"
  echo
  echo "For everything else, decide file-by-file, then continue:"
  echo "  git add <resolved-files>"
  echo "  git rebase --continue"
  echo
  echo "After success:"
  echo "  git push --force-with-lease"
  exit $REBASE_STATUS
fi

echo
echo "Rebase complete. Push with:"
echo "  git push --force-with-lease"

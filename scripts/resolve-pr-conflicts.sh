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

echo "Rebasing $WORK_BRANCH onto $TARGET_REMOTE/$TARGET_BRANCH..."
set +e
git rebase "$TARGET_REMOTE/$TARGET_BRANCH"
REBASE_STATUS=$?
set -e

if [[ $REBASE_STATUS -ne 0 ]]; then
  echo
  echo "Conflicts detected. For UI files during rebase, keep THIS branch's changes with --theirs:"
  echo "  git checkout --theirs index.html app.js styles.css README.md"
  echo "  git add index.html app.js styles.css README.md"
  echo "  git rebase --continue"
  echo
  echo "Repeat until rebase completes, then push:"
  echo "  git push --force-with-lease"
  exit $REBASE_STATUS
fi

echo
echo "Rebase complete. Push with:"
echo "  git push --force-with-lease"

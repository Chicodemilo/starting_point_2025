#!/bin/bash
# git_flo.sh - Quickly add, commit, and push all changes with a supplied commit message

set -e

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 \"commit message here\""
  exit 1
fi

COMMIT_MSG="$1"
BRANCH="main"

# Stage all changes
git add .

# Commit with message
git commit -m "$COMMIT_MSG"

# Push to the main branch
git push origin $BRANCH

echo "All changes committed and pushed to $BRANCH."

#!/bin/bash
set -e
cd "$(dirname "$0")"

GH="${GH:-/opt/homebrew/bin/gh}"

if ! "$GH" auth status &>/dev/null; then
  echo "Not logged in to GitHub. Run:"
  echo "  $GH auth login"
  echo "Then run this script again."
  exit 1
fi

REPO_NAME="${1:-ahluwalia-farm-wwebsites}"

if git remote get-url origin &>/dev/null; then
  echo "Remote 'origin' already exists."
else
  "$GH" repo create "$REPO_NAME" --public --source=. --remote=origin --description "Ahluwalia Farm — organic honey and cage-free eggs display website"
fi

git push -u origin main
echo ""
echo "Done! View your repo:"
"$GH" repo view --web 2>/dev/null || "$GH" repo view

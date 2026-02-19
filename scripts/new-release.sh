#!/usr/bin/env bash
set -e

# Usage: ./scripts/new-release.sh 1.2.0
VERSION="${1:?Usage: $0 <version>  e.g. $0 1.2.0}"
BRANCH="release/v${VERSION}"

# Validate semver format
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Error: version must be in X.Y.Z format"
  exit 1
fi

# Ensure we are on main and it is clean
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "main" ]; then
  echo "Error: must be run from main branch (currently on ${CURRENT})"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working directory is not clean. Commit or stash changes first."
  exit 1
fi

echo "Pulling latest main..."
git pull origin main

echo "Creating branch ${BRANCH}..."
git checkout -b "$BRANCH"

echo "Bumping versions to ${VERSION}..."
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '${VERSION}';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
  pkg.version = '${VERSION}';
  fs.writeFileSync('server/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

git add package.json server/package.json
git commit -m "chore: bump version to ${VERSION}"

echo "Pushing ${BRANCH} to origin..."
git push -u origin "$BRANCH"

echo ""
echo "Done. Release branch ${BRANCH} is ready."
echo "Create feature branches off ${BRANCH} and open PRs targeting ${BRANCH}."
echo "When ready to ship, update CHANGELOG.md, then open a PR from ${BRANCH} to main."

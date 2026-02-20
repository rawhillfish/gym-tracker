# Release Process

## Overview

```
main (production) ← only receives merges from release branches
  └── release/vX.Y.Z ← all work happens here
         ├── feature/my-feature
         └── fix/some-bug
```

Merging a release branch into `main` automatically creates a git tag and GitHub Release.

---

## Starting a New Release Cycle

Run from `main` with a clean working directory:

```bash
./scripts/new-release.sh 1.2.0
```

This will:
1. Pull the latest `main`
2. Create and push `release/v1.2.0`
3. Bump the version in `package.json` and `server/package.json`

---

## During the Release Cycle

Create feature or fix branches off the release branch:

```bash
git checkout release/v1.2.0
git checkout -b feature/my-feature
# ... do work and commit ...
git push origin feature/my-feature
```

Then open a PR on GitHub targeting `release/v1.2.0` (not `main`).

The `Build` check will run automatically. Merge once it passes.

---

## Shipping the Release

1. **Update [CHANGELOG.md](CHANGELOG.md)**
   - Rename `## [Unreleased]` to `## [1.2.0] - YYYY-MM-DD`
   - Add a new empty `## [Unreleased]` section at the top
   - Commit: `git commit -m "chore: prepare release v1.2.0"`
   - Push: `git push origin release/v1.2.0`

2. **Open a PR** on GitHub: `release/v1.2.0` → `main`

3. **Merge the PR** once the `Build` check passes

4. **Done** — GitHub Actions will automatically:
   - Read the version from `package.json`
   - Create a `v1.2.0` git tag
   - Create a GitHub Release with `CHANGELOG.md` as the body
   - Netlify and Render will auto-deploy from `main`

---

## Hotfix (urgent production bug)

Branch directly off `main`, not a release branch:

```bash
git checkout main
git pull origin main
git checkout -b fix/critical-bug
# ... fix, commit ...
git push origin fix/critical-bug
```

- Update `CHANGELOG.md` with the fix under `## [Unreleased]`
- Manually bump the patch version in `package.json` and `server/package.json` (e.g. `1.1.0` → `1.1.1`)
- Open a PR: `fix/critical-bug` → `main`
- Merge → tag `v1.1.1` is created automatically

---

## Versioning

Uses [Semantic Versioning](https://semver.org):

| Change type | Example |
|---|---|
| New feature | `1.1.0` → `1.2.0` |
| Bug fix / small tweak | `1.1.0` → `1.1.1` |
| Breaking change | `1.1.0` → `2.0.0` |

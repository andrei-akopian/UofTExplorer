# Contributing Guide

## Commit Messages

### Structure

Follow the [Conventional Commits](https://blog.marcnuri.com/conventional-commits) format:

```bash
<type>: <description>

<optional body>
```

- `type` — Describes the category of change (required)
- `description` — A brief summary of the change (required)
- `body` — A more detailed explanation of the change (optional)

### Commit Types

Loosely based on [Conventional Commits](https://blog.marcnuri.com/conventional-commits) format.

- `build` — Changes to build system or external dependencies
- `docs` — Documentation-only changes
- `feat` — New feature
- `fix` — Bug fix
- `ops` — Infrastructure, deployment, backup, recovery operations
- `perf` — Performance improvements (a special type of refactor)
- `proto` — Prototyping a feature/algorithm; not finished
- `refactor` — Code changes that neither fix bugs nor add features
- `style` — Code style changes (formatting, whitespace, etc.)

### Syntax

Follow most of the 7 rules of Git commit messages from [cbea.ms/git-commit/](https://cbea.ms/git-commit/):

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. ~~Capitalize the subject line~~
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line — write "add feature" not "added feature"
6. Wrap the body at 72 characters
7. Use the body to explain what and why, not how — the code shows how; explain the reasoning

## Branches

### Branch Types

- `main` — Production-ready code. Always stable and working.
- `develop` — Integration and testing branch. Contains features being prepared for release.
- `type/*` — Individual branches for development work.

### Branch Naming

Follow [Git branch naming conventions](https://medium.com/@jaychu259/git-branch-naming-conventions-2025-the-ultimate-guide-for-developers-5f8e0b3bb9f7).

**Format:** `<type>/<description>`

**Types:**
- `docs/` — Documentation updates
- `feat/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code refactoring (no behavior change)

**Rules:**
- Use lowercase with hyphens (`feature/add-search-filter`)
- Keep descriptions short but descriptive (3-5 words max)
- Avoid special characters, spaces, and ambiguous names
- For *extremely simple* diffs (e.g. updating external dependencies), you can commit straight to `develop`

### Workflow

1. Create your branch from `develop`:
  ```bash
  git switch develop
  git pull origin develop
  git switch -c <branch-name>
  ```

2. Keep your branch updated with `develop` as you are working:
  ```bash
  git fetch origin
  git rebase origin/develop  # This rewrites the shared commit history in chronological order

  # When ready to commit to origin:
  git push origin <branch-name> --force-with-lease  # This updates the remote branch to match your local branch with rebased history
  ```

3. Before merging into `develop`, ensure:
  - Your branch is up to date with `develop` (i.e. follow Step 2)
  - All tests pass
  - Code is reviewed (by you and/or others)

4. Merge your branch into `develop`:
  ```bash
  git switch develop
  git pull origin develop
  git merge <branch-name>
  git push origin develop
  ```

5. Open a pull request on GitHub to merge to `main`:
  - The pull request step can be skipped if the diff is very small
  - `main` always contains a stable, working version

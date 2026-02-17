# Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to run quality checks before commits and pushes.

## Pre-commit Hook

The pre-commit hook runs the following checks:

1. **Type checking** - `just typecheck`
2. **Format checking** - `just format-check`
3. **Unit tests** - `just test`

All checks must pass before a commit is allowed.

## Pre-push Hook

The pre-push hook runs more comprehensive checks:

1. **Full check suite** - `just check` (typecheck + format + test)
2. **BDD smoke tests** - `just bdd-api` (API-only tests for speed)

These ensure code quality before pushing to the remote repository.

## Setup

Husky is automatically initialized when you run `bun install` (via the `prepare` script in `package.json`).

If you need to manually set up Husky:
```bash
bunx husky install
```

## Alternative: Light Pre-commit Hook

If the full pre-commit checks are too slow for your workflow, you can use the lighter version that skips tests:

```bash
mv .husky/pre-commit .husky/pre-commit.full
mv .husky/pre-commit.light .husky/pre-commit
```

This runs only typecheck and format checks. **Make sure to run tests manually before pushing!**

To restore the full version:
```bash
mv .husky/pre-commit .husky/pre-commit.light
mv .husky/pre-commit.full .husky/pre-commit
```

## Bypassing Hooks (Emergency Only)

If you need to bypass hooks in an emergency:
```bash
# Skip pre-commit
git commit --no-verify -m "your message"

# Skip pre-push
git push --no-verify
```

**⚠️ Use this sparingly!** The hooks exist to maintain code quality.

## Troubleshooting

### "just: command not found"

Install `just` command runner:
```bash
# macOS
brew install just

# Linux
cargo install just

# Or see: https://github.com/casey/just#installation
```

### Hook not running

Make sure the hooks are executable:
```bash
chmod +x .husky/pre-commit .husky/pre-push
```

### Checks failing

Run the checks manually to see details:
```bash
just typecheck
just format-check
just test
just bdd-api
```

Fix issues and try committing/pushing again. Or use auto-fix where available:
```bash
just fix         # Auto-fix lint + format
just format      # Auto-format only
```

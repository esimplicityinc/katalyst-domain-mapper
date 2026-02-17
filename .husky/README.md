# Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to run quality checks before commits.

## Pre-commit Hook

The pre-commit hook runs the following checks:

1. **Type checking** - `just typecheck`
2. **Linting** - `just lint`
3. **Format checking** - `just format-check`
4. **Unit tests** - `just test`

All checks must pass before a commit is allowed.

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

This runs only typecheck, lint, and format checks. **Make sure to run tests manually before pushing!**

To restore the full version:
```bash
mv .husky/pre-commit .husky/pre-commit.light
mv .husky/pre-commit.full .husky/pre-commit
```

## Bypassing Hooks (Emergency Only)

If you need to bypass the pre-commit hook in an emergency:
```bash
git commit --no-verify -m "your message"
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

Make sure the hook is executable:
```bash
chmod +x .husky/pre-commit
```

### Checks failing

Run the checks manually to see details:
```bash
just typecheck
just lint
just format-check
just test
```

Fix issues and try committing again. Or use auto-fix where available:
```bash
just lint-fix
just format
```

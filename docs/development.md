# Development Guide

Welcome to the Smart Hire codebase! This guide covers coding standards, workspace guidelines, and onboarding steps.

---

## Workspace Tooling

### TypeScript

- All workspace projects must extend `@smarthire/config/typescript/base.json` or `@smarthire/config/typescript/nextjs.json`.
- Strict mode is enabled globally. Do not disable type-checking.

### ESLint & Formatting

- Code styles are managed via **Prettier** and enforced on commit hooks.
- ESLint configurations map to CJS profiles in `packages/config/eslint/`. Extensions must inherit from base configs to ensure rules remain uniform across apps.

---

## Git Workflow & Hooks

We enforce code quality standards on local environments using git hooks.

### pre-commit Hook

Whenever a developer issues a `git commit`, Husky triggers `pnpm exec lint-staged`.

- Staged `.ts` and `.tsx` files are processed by `eslint --fix` and `prettier --write`.
- Staged configurations and assets are formatted via `prettier --write`.
- Files with syntax or styling errors that cannot be auto-fixed will fail the commit. Correct the errors before attempting to commit again.

---

## Environment Variable Architecture

Environment variables are validated strictly via **Zod** schema schemas inside `src/env.ts` in each application.

- Server-side environment variables (e.g. database credentials) must _only_ be loaded in server-side files.
- Client-side variables must start with the `NEXT_PUBLIC_` prefix to be available to client components.
- Adding a new env variable requires updating `.env.example` and the zod schemas inside `env.ts`.

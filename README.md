# Smart Hire - Workspace Foundation

Smart Hire is a production-grade, AI-powered recruitment platform built using a microservice architecture. This repository is configured as a high-performance monorepo using **Turborepo** and **pnpm Workspaces**.

---

## Workspace Architecture

The monorepo structure divides responsibilities clearly between application services (`apps/`) and shared library packages (`packages/`):

```
smart-hire/
├── .husky/              # Git commit hook triggers
├── apps/
│   └── web/             # Next.js 15 app router application (portal / dashboard)
├── packages/
│   ├── config/          # Shared developer configurations (eslint rules, tsconfigs)
│   ├── ui/              # Shared design system components (React & Tailwind)
│   ├── types/           # Core domain TypeScript models & schemas
│   ├── logger/          # Unified server/client-side log utilities
│   └── utils/           # Utility helpers (Tailwind class mergers, date utilities)
├── docs/                # Architectural & development documentation
├── docker/              # Local container setups (Dockerfile.dev)
├── docker-compose.yml   # Orchestrates dev services locally
├── pnpm-workspace.yaml  # pnpm workspace configurations
├── turbo.json           # Turborepo task pipeline configs
└── package.json         # Root scripts & monorepo devDependencies
```

---

## Getting Started

### Prerequisites

- **Node.js**: `>=20.0.0`
- **pnpm**: `>=10.0.0`
- **Docker**: For running containerized local services

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd "smart hire"
   ```
2. Install dependencies workspace-wide:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

---

## Development Scripts

All task execution is managed at the root directory level via `pnpm` and orchestrated by `turbo`:

| Script            | Command                | Description                                                               |
| :---------------- | :--------------------- | :------------------------------------------------------------------------ |
| `pnpm run dev`    | `turbo dev`            | Runs Next.js and all local applications in dev mode with hot reloading    |
| `pnpm run build`  | `turbo build`          | Builds all packages and Next.js applications in correct topological order |
| `pnpm run lint`   | `turbo lint`           | Lints all packages and apps using shared ESLint/Next.js configurations    |
| `pnpm run format` | `prettier --write ...` | Formats the codebase using Prettier according to root specifications      |

---

## Code Quality & CI Hooks

This workspace implements automated quality gates:

- **Pre-commit Hook**: [Husky](https://typicode.github.io/husky/) runs `lint-staged` on every commit.
- **Lint-Staged**: Evaluates modified files with ESLint (`--fix`) and Prettier (`--write`) before confirming commits.

---

## Docker Execution

To spin up containerized development services:

```bash
docker compose up --build
```

This boots the `smarthire-web` container and maps host file changes to enable hot-reloading.

---

## Further Reading

- [Architecture Design Document](./docs/architecture.md)
- [Developer Setup Guidelines](./docs/development.md)

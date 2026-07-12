# Coding Standards and Git Conventions

This document establishes the coding conventions, code style, directory structures, and git hygiene policies for the **Smart Hire** project.

---

## 1. Directory Structure Conventions

Always adhere to the established package separation model:

- **`apps/`**: Holds runnable, deployed services (e.g. `web`).
- **`packages/`**: Holds internal shared libraries that do _not_ contain business logic or routing structures.
- **`src/` Directory**: All source code inside apps or packages must live under a `/src` directory (with exceptions for configuration files like `package.json` or `tsconfig.json`).
- **Path Aliases**:
  - Apps should use `@/*` pointing to `src/*` (e.g., import from `@/components/...`).
  - Shared libraries should be imported using their package name (e.g. `@smarthire/ui`, `@smarthire/utils`).

---

## 2. Coding Conventions

### 2.1. TypeScript Guidelines

- **Strict Typing**: Strict type-checking is enabled globally (`"strict": true`). Do not use `any` unless absolutely unavoidable. Use `unknown` or union/generic parameters instead.
- **Interfaces vs Types**:
  - Use `interface` for structural object shapes, especially if they are intended to be extended:
    ```typescript
    export interface Job {
      id: string;
      title: string;
    }
    ```
  - Use `type` for unions, intersections, primitives, and utility types:
    ```typescript
    export type JobStatus = "draft" | "published" | "closed";
    ```
- **Explicit Returns**: Functions should declare return types, particularly in public APIs or exported library functions.

### 2.2. React & Next.js Guidelines (for `apps/web` and `packages/ui`)

- **Functional Components**: Use arrow or standard functions for React components:
  ```tsx
  export const Card = ({ title }: CardProps) => {
    return <div>{title}</div>;
  };
  ```
- **Component Placement**: Private components used only in a single page belong in that page's subdirectory. Shared components belong in `packages/ui/src/`.
- **Client vs Server Components**:
  - Next.js 15 uses server components by default.
  - Add the `"use client"` directive at the very top of files _only_ when utilizing state (`useState`, `useReducer`), effects (`useEffect`), browser APIs, or custom event callbacks.

### 2.3. Formatting & Linting

- **Prettier**: Enforced globally on code save. Indentation is strictly `2` spaces. Lines must wrap at `100` characters. Double quotes are standard.
- **ESLint**: Runs on commit hooks. Fix all warning-level and error-level issues. Do not disable ESLint rules inline (e.g. `/* eslint-disable */`) without lead review.

---

## 3. Naming Conventions

To keep code readable, use the following casing schemes consistently:

| Category                        | Casing             | Example                             |
| :------------------------------ | :----------------- | :---------------------------------- |
| **Files & Folders**             | `kebab-case`       | `job-card.tsx`, `use-calendar.ts`   |
| **React Components**            | `PascalCase`       | `Button`, `UserProfile`             |
| **Classes**                     | `PascalCase`       | `ResumeParserService`, `HttpClient` |
| **Functions & Variables**       | `camelCase`        | `formatDate()`, `isLoading`         |
| **TypeScript Types/Interfaces** | `PascalCase`       | `Candidate`, `JobStatus`            |
| **Constants & Enum Members**    | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_SIZE`, `DEFAULT_PORT`   |
| **DB Tables & Columns**         | `snake_case`       | `job_applications`, `created_at`    |

---

## 4. Git & Commit Conventions

### 4.1. Branch Naming

All branches must follow a structured prefix model:

- `feature/<ticket-id>-<description>` : For new features.
- `bugfix/<ticket-id>-<description>` : For fixing issues.
- `chore/<description>` : Updating build systems, packages, configs, or docs.
- `hotfix/<description>` : Immediate production patch branches.

_Example_: `feature/SH-102-resume-upload-ui`

### 4.2. Commit Message Format (Conventional Commits)

We follow the [Conventional Commits specification](https://www.conventionalcommits.org/). Commit messages must follow this structure:

```
<type>(<scope>): <description>

[optional body]
```

#### Types:

- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation updates only.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to the build process, package configurations, or auxiliary tools.

#### Example Commit:

```
feat(web): add resume upload dropzone component

- Integrate React Dropzone with styles matching the design system
- Use shared CN utility from @smarthire/utils for styling classes
```

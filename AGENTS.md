# AGENTS.md

This monorepo contains the Doom documentation tool, export functionality, and related packages. Doom is a documentation generator built on top of Rspress.

## Setup

- Install dependencies: `yarn install`
- Node.js 18.17.0+ (but not 20.0.0, use 20.1.0+)

## Commands

- **Build**: `yarn build` (all packages) | `yarn build:all` (workspace packages)
- **Clean**: `yarn clean` (main build) | `yarn clean:all` (all workspace packages)
- **Lint**: `yarn lint` (main project) | `yarn lint:all` (all workspace packages)
- **Format**: `yarn format` (format code)
- **Dev**: `yarn dev` (development mode)
- **Docs**: `yarn docs` (build and export docs) | `yarn docs:build` | `yarn docs:export`
- **Workspace**: `yarn workspace:info` (list packages) | `yarn workspace @alauda/doom <command>`

## Code style

- **Formatting**: Prettier configuration
- **Types**: TypeScript strict mode
- **Linting**: ESLint with project-specific rules
- **Naming**: Follow existing patterns in the codebase

## Architecture

- **Structure**: Monorepo (Yarn workspaces)
  - `packages/doom/`: Main documentation tool and CLI
  - `packages/export/`: Document export functionality
  - `docs/`: Project documentation
  - `fixture-docs/`: Test documentation
- **Testing**: Currently uses existing build validation
- **Configuration**:
  - `doom.config.yml`: Main configuration
  - `tsconfig.json`: TypeScript configuration
  - `eslint.config.js`: Linting rules

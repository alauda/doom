# AGENTS.md

This monorepo contains the Doom documentation tool, export functionality, and related packages. Doom is a documentation generator built on top of Rspress.

## Setup

- Install dependencies: `yarn install`
- Node.js 20.19.0+

## Commands

- **Build**: `yarn build` (clean and compile TypeScript)
- **Dev**: `yarn dev` (development mode with file watching)
- **Docs**: `yarn docs` (build and export docs) | `yarn docs:build` | `yarn docs:export`
- **Format**: `yarn format` (format code with Prettier)
- **Lint**: `yarn lint` (ESLint check)
- **Serve**: `yarn serve` (serve built documentation)
- **Test**: `yarn typecov` (type coverage check)
- **Release**: `yarn release` (build and publish packages)
- **Workspace**: `yarn workspaces list` (list packages) | `yarn workspace <name> <command>`

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
- **Testing**: Type coverage validation (`yarn typecov`)
- **Configuration**:
  - `doom.config.yml`: Main configuration
  - `tsconfig.json`: TypeScript configuration
  - `eslint.config.js`: Linting rules

# Doom

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/alauda/doom/ci.yml?branch=main)](https://github.com/alauda/doom/actions/workflows/ci.yml?query=branch%3Amain)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Falauda%2Fdoom%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/alauda/doom)](https://coderabbit.ai)
[![npm](https://img.shields.io/npm/v/@alauda/doom.svg)](https://www.npmjs.com/package/@alauda/doom)
[![GitHub Release](https://img.shields.io/github/release/alauda/doom)](https://github.com/alauda/doom/releases)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/alauda/doom)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/changesets/changesets)

Doctor Doom making docs.

Please view <https://doom.js.org/> for its documents.

## Monorepo Setup

This repository is structured as a yarn workspaces monorepo containing the following packages:

- **[@alauda/doom](./packages/doom)** - The main documentation tool and CLI
- **[@alauda/doom-export](./packages/export)** - Document export functionality

### Prerequisites

- **Node.js**: Version 18.17.0+ (but not 20.0.0, use 20.1.0+)
- **Yarn**: Version 4.9.4+ (included via `packageManager` field)

### Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/alauda/doom.git
   cd doom
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

3. **Build all packages:**
   ```bash
   yarn build
   ```

### Common Development Commands

#### Building and Cleaning

```bash
# Build all packages
yarn build

# Build specific workspace packages
yarn build:all

# Clean build artifacts
yarn clean

# Clean all workspace packages
yarn clean:all
```

#### Development and Testing

```bash
# Start development mode
yarn dev

# Lint all code
yarn lint

# Lint all workspace packages
yarn lint:all

# Test all workspace packages (if tests exist)
yarn test:all

# Format code
yarn format

# Type coverage check
yarn typecov
```

#### Documentation

```bash
# Build documentation
yarn docs:build

# Export documentation
yarn docs:export

# Build and export (combined)
yarn docs

# Serve built documentation
yarn serve

# Translate documentation
yarn translate
```

#### Workspace Management

```bash
# List all workspaces
yarn workspace:info

# Run command in specific workspace
yarn workspace @alauda/doom <command>

# Run command in all workspaces
yarn workspaces foreach --all run <command>
```

#### Release Management

```bash
# Create a changeset
yarn changeset

# Version packages
yarn version

# Publish packages
yarn release
```

### Package Structure

```
packages/
├── doom/                    # Main documentation tool
│   ├── src/                # Source code
│   ├── lib/                # Built output
│   └── package.json
└── export/                 # Export functionality
    ├── src/                # Source code (if applicable)
    ├── lib/                # Built output
    └── package.json
```

### Adding New Packages

To add a new package to the monorepo:

1. Create a new directory under `packages/`
2. Add a `package.json` with appropriate name (e.g., `@alauda/doom-<name>`)
3. The package will be automatically discovered by the workspace configuration

### Troubleshooting

- **Build issues**: Run `yarn clean` followed by `yarn build`
- **Dependency issues**: Try `yarn install --immutable` to ensure lockfile consistency
- **Type issues**: Run `yarn typecov` to check type coverage

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [Alauda][]

[alauda]: https://www.alauda.io
[MIT]: http://opensource.org/licenses/MIT

## ADDED Requirements

### Requirement: Rstest package installation

The system SHALL have `@rstest/core` installed as a root devDependency at version `^0.9.0` or later.

#### Scenario: Package is available after install

- **WHEN** `yarn install` is run
- **THEN** `@rstest/core` is resolvable from the workspace root

### Requirement: Root rstest configuration

The system SHALL have a root `rstest.config.ts` that discovers per-package test configurations via `projects: ['packages/*']`.

#### Scenario: Root config references packages

- **WHEN** `rstest` is invoked from the workspace root
- **THEN** it discovers and runs tests from both `packages/doom` and `packages/export` projects

### Requirement: Per-package rstest configuration

Each package (`packages/doom` and `packages/export`) SHALL have its own `rstest.config.ts` that:

- Sets `testEnvironment: 'node'`
- Includes test files matching `test/**/*.spec.ts`
- Imports shared configuration from the root

#### Scenario: Doom package test discovery

- **WHEN** rstest runs the `doom` project
- **THEN** it discovers test files under `packages/doom/test/**/*.spec.ts`

#### Scenario: Export package test discovery

- **WHEN** rstest runs the `export` project
- **THEN** it discovers test files under `packages/export/test/**/*.spec.ts`

### Requirement: Test scripts in root package.json

The root `package.json` SHALL include the following scripts:

- `test` — runs `rstest run`
- `test:watch` — runs `rstest watch`

#### Scenario: Running all tests

- **WHEN** `yarn test` is executed
- **THEN** rstest runs all discovered tests across both packages and exits with code 0 if all pass

#### Scenario: Watch mode

- **WHEN** `yarn test:watch` is executed
- **THEN** rstest enters watch mode, re-running affected tests on file changes

### Requirement: Test files excluded from production build

Test files in `packages/<pkg>/test/` SHALL NOT be compiled by `tsc -b` or included in published npm packages.

#### Scenario: Build does not include test files

- **WHEN** `yarn build` is executed
- **THEN** no files from `packages/doom/test/` or `packages/export/test/` appear in `packages/doom/lib/` or `packages/export/lib/`

#### Scenario: Published package excludes tests

- **WHEN** `npm pack` is run in either package directory
- **THEN** the resulting tarball contains no files from the `test/` directory

### Requirement: Type coverage exclusion

The `typeCoverage.ignoreFiles` array in root `package.json` SHALL include `"**/test/**"` so test files do not affect the 100% type-coverage threshold.

#### Scenario: Type coverage passes with test files present

- **WHEN** `yarn typecov` is executed
- **THEN** test files are excluded from coverage calculation and the existing 100% threshold is maintained

### Requirement: CI integration

The CI workflow SHALL run `yarn test` as part of the validation matrix alongside `build`, `lint`, and `typecov`.

#### Scenario: CI runs tests

- **WHEN** a CI build is triggered
- **THEN** `yarn test` is executed and the build fails if any test fails

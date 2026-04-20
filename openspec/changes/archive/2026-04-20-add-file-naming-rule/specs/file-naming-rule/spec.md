## ADDED Requirements

### Requirement: Validate document filename pattern

The rule SHALL validate that document filenames contain only lowercase English letters (`a-z`), digits (`0-9`), and underscores (`_`). The filename (without extension) MUST match the pattern `^_?[a-z0-9]+(_[a-z0-9]+)*$`.

#### Scenario: Valid simple filename

- **WHEN** the document filename is `getting_started.md`
- **THEN** no lint warning is reported

#### Scenario: Valid filename starting with underscore

- **WHEN** the document filename is `_sidebar.md`
- **THEN** no lint warning is reported

#### Scenario: Invalid filename with uppercase letters

- **WHEN** the document filename is `GettingStarted.md`
- **THEN** a lint warning is reported indicating the filename does not match the required pattern

#### Scenario: Invalid filename with hyphens

- **WHEN** the document filename is `getting-started.md`
- **THEN** a lint warning is reported indicating the filename does not match the required pattern

#### Scenario: Invalid filename ending with underscore

- **WHEN** the document filename is `getting_started_.md`
- **THEN** a lint warning is reported indicating the filename does not match the required pattern

#### Scenario: Valid mdx filename

- **WHEN** the document filename is `my_component.mdx`
- **THEN** no lint warning is reported

### Requirement: Index files validate parent directory name

For `index.md` and `index.mdx` files, the rule SHALL validate the parent directory name (basename of dirname) instead of the filename itself, using the same pattern.

#### Scenario: Index file with valid parent directory

- **WHEN** the document path is `docs/getting_started/index.md`
- **THEN** no lint warning is reported

#### Scenario: Index file with invalid parent directory

- **WHEN** the document path is `docs/Getting-Started/index.md`
- **THEN** a lint warning is reported indicating the directory name does not match the required pattern

#### Scenario: Index file at root (no parent directory)

- **WHEN** the document is `index.md` with no parent directory information available
- **THEN** no lint warning is reported (skip validation)

### Requirement: Skip validation when path unavailable

The rule SHALL silently skip validation when the vfile has no basename (e.g., stdin or virtual files).

#### Scenario: Virtual file with no path

- **WHEN** the document has no file path (e.g., piped from stdin)
- **THEN** no lint warning is reported and no error is thrown

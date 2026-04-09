## ADDED Requirements

### Requirement: Shared lint rule test helper

The system SHALL provide a shared test helper at `packages/doom/test/remark-lint/_helper.ts` that:

- Accepts a remark-lint rule and a markdown string
- Parses the markdown using `remark` with `remark-gfm` and `remark-frontmatter` (matching the project's actual pipeline)
- Returns the resulting `vfile.messages` array for assertion

#### Scenario: Helper processes markdown and returns messages

- **WHEN** `lint(someRule, '# Valid heading\n')` is called
- **THEN** it returns an array of vfile messages (empty if no violations)

#### Scenario: Helper supports MDX rules

- **WHEN** `lintMdx(mdxRule, '<OpenAPIPath />\n<OpenAPIPath />')` is called with the MDX variant
- **THEN** it parses as MDX and returns appropriate messages

### Requirement: no-deep-heading rule tests

The system SHALL have unit tests for the `noDeepHeading` rule that flags headings deeper than level 5.

#### Scenario: Allows h1 through h5

- **WHEN** markdown contains headings at depths 1 through 5
- **THEN** no lint messages are produced

#### Scenario: Flags h6

- **WHEN** markdown contains `###### Deep heading`
- **THEN** a message is produced containing `Unexpected deep heading level 6, maximum is 5`

### Requirement: maximum-link-content-length rule tests

The system SHALL have unit tests for the `maximumLinkContentLength` rule that flags link text longer than 40 characters.

#### Scenario: Allows short link text

- **WHEN** markdown contains `[short text](url)`
- **THEN** no lint messages are produced

#### Scenario: Flags long link text

- **WHEN** markdown contains a link with text exceeding 40 characters in visual width
- **THEN** a message is produced containing `is too long, maximum is 40 characters`

#### Scenario: Skips URL-like link text

- **WHEN** link text is a valid URL (e.g., `[https://example.com/very/long/path/here](url)`)
- **THEN** no lint message is produced regardless of length

### Requirement: list-item-punctuation rule tests

The system SHALL have unit tests for the `listItemPunctuation` rule that enforces consistent list item punctuation.

#### Scenario: Allows consistent punctuation

- **WHEN** all list items end with the same punctuation mark (e.g., all end with `;`)
- **THEN** no lint messages are produced

#### Scenario: Flags inconsistent punctuation

- **WHEN** the first list item ends with `;` but a subsequent item ends with `,`
- **THEN** a message is produced about mismatched punctuation

#### Scenario: Last item must end with period when punctuated

- **WHEN** list items are punctuated but the last item does not end with `.`
- **THEN** a message is produced indicating the last item should end with a period

#### Scenario: Skips single-item lists

- **WHEN** a list contains only one item
- **THEN** no lint messages are produced

### Requirement: list-item-size rule tests

The system SHALL have unit tests for the `listItemSize` rule that limits list items to 10.

#### Scenario: Allows lists with 10 or fewer items

- **WHEN** a list has 10 items
- **THEN** no lint messages are produced

#### Scenario: Flags lists with more than 10 items

- **WHEN** a list has 11 items
- **THEN** a message is produced about exceeding the maximum

### Requirement: list-table-introduction rule tests

The system SHALL have unit tests for the `listTableIntroduction` rule requiring introductory text before lists/tables.

#### Scenario: Allows list preceded by paragraph

- **WHEN** a list is preceded by a paragraph
- **THEN** no lint messages are produced

#### Scenario: Flags list preceded by heading

- **WHEN** a list immediately follows a heading with no paragraph between
- **THEN** a message is produced about missing introduction

### Requirement: no-deep-list rule tests

The system SHALL have unit tests for the `noDeepList` rule that limits list nesting to depth 4.

#### Scenario: Allows nesting up to depth 4

- **WHEN** lists are nested 4 levels deep
- **THEN** no lint messages are produced

#### Scenario: Flags nesting deeper than 4

- **WHEN** lists are nested 5 levels deep
- **THEN** a message is produced about excessive nesting depth

### Requirement: no-empty-table-cell rule tests

The system SHALL have unit tests for the `noEmptyTableCell` rule.

#### Scenario: Allows filled table cells

- **WHEN** all table cells contain content
- **THEN** no lint messages are produced

#### Scenario: Flags empty table cells

- **WHEN** a table cell has no content
- **THEN** a message is produced about the empty cell

### Requirement: no-heading-punctuation rule tests

The system SHALL have unit tests for the `noHeadingPunctuation` rule.

#### Scenario: Allows headings without trailing punctuation

- **WHEN** a heading has no trailing punctuation
- **THEN** no lint messages are produced

#### Scenario: Flags trailing punctuation in headings

- **WHEN** a heading ends with a punctuation mark (e.g., `## Title.`)
- **THEN** a message is produced about trailing punctuation

#### Scenario: Allows question marks in FAQ files

- **WHEN** the file basename contains `faq` and a heading ends with `?`
- **THEN** no lint message is produced

### Requirement: no-heading-special-characters rule tests

The system SHALL have unit tests for the `noHeadingSpecialCharacters` rule.

#### Scenario: Allows normal heading text

- **WHEN** headings contain only alphanumeric text
- **THEN** no lint messages are produced

#### Scenario: Flags special characters in headings

- **WHEN** a heading contains `*`, `+`, `/`, `^`, `|`, or `~`
- **THEN** a message is produced listing the offending characters

### Requirement: no-heading-sup-sub rule tests

The system SHALL have unit tests for the `noHeadingSupSub` rule.

#### Scenario: Allows headings without HTML

- **WHEN** headings contain plain text
- **THEN** no lint messages are produced

#### Scenario: Flags sup/sub tags in headings

- **WHEN** a heading contains `<sup>` or `<sub>` HTML
- **THEN** a message is produced about disallowed HTML tags

### Requirement: no-multi-open-api-paths rule tests

The system SHALL have unit tests for the `noMultiOpenAPIPaths` rule.

#### Scenario: Allows single OpenAPIPath

- **WHEN** MDX contains one `<OpenAPIPath />` component
- **THEN** no lint messages are produced

#### Scenario: Flags multiple OpenAPIPath components

- **WHEN** MDX contains two or more `<OpenAPIPath />` components
- **THEN** a message is produced instructing to use an array prop instead

### Requirement: no-paragraph-indent rule tests

The system SHALL have unit tests for the `noParagraphIndent` rule.

#### Scenario: Allows unindented paragraphs

- **WHEN** paragraphs start at column 0
- **THEN** no lint messages are produced

#### Scenario: Flags indented paragraphs

- **WHEN** a root-level paragraph starts with leading spaces
- **THEN** a message is produced about paragraph indentation

### Requirement: table-size rule tests

The system SHALL have unit tests for the `tableSize` rule.

#### Scenario: Allows tables with multiple rows and columns

- **WHEN** a table has 2+ rows and 2+ columns
- **THEN** no lint messages are produced

#### Scenario: Flags single-row table

- **WHEN** a table has only a header row and no data rows
- **THEN** a message is produced suggesting a list instead

#### Scenario: Flags single-column table

- **WHEN** a table has only one column
- **THEN** a message is produced suggesting a list instead

### Requirement: unit-case rule tests

The system SHALL have unit tests for the `unitCase` rule.

#### Scenario: Allows correctly-cased units

- **WHEN** text contains properly-cased units (e.g., `Ki`, `M`)
- **THEN** no lint messages are produced

#### Scenario: Flags incorrectly-cased units

- **WHEN** text contains a unit with wrong casing
- **THEN** a message is produced suggesting the canonical form

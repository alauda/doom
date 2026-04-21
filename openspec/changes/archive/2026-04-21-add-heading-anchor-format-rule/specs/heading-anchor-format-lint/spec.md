## ADDED Requirements

### Requirement: Canonical heading anchor syntax

The remark-lint system MUST treat `{#id}` appended to heading text as the canonical heading anchor declaration format and MUST require this form when authors intend to assign heading ids.

#### Scenario: Heading id declared with canonical syntax

- **WHEN** a heading is authored as `# Title {#hash}`
- **THEN** the `heading-anchor-format` rule SHALL accept the heading without reporting a formatting violation

### Requirement: Forbid id-bearing HTML or MDX elements inside headings

The `heading-anchor-format` rule MUST report a violation when any HTML or MDX element with an `id` attribute is authored inside heading content, and the diagnostic MUST instruct using `{#id}` in the heading text instead.

#### Scenario: HTML anchor appears inside heading text

- **WHEN** a heading contains inline HTML such as `# Title <a id="hash"></a>` or `# Title <a id="hash" />`
- **THEN** linting SHALL report a `doom-lint:heading-anchor-format` violation with guidance to rewrite as `# Title {#hash}`

#### Scenario: Non-anchor HTML element appears inside heading text

- **WHEN** a heading contains inline HTML such as `# Title <span id="hash"></span>`
- **THEN** linting SHALL report a `doom-lint:heading-anchor-format` violation with guidance to rewrite as `# Title {#hash}`

#### Scenario: MDX JSX id-bearing node appears inside heading text

- **WHEN** a heading contains MDX JSX content equivalent to an inline element with an `id` attribute
- **THEN** linting SHALL report a `doom-lint:heading-anchor-format` violation with guidance to use `{#id}` suffix syntax

### Requirement: Forbid id-bearing elements around headings

The `heading-anchor-format` rule MUST report a violation when any HTML or MDX element with an `id` attribute is placed before or after a heading node to emulate heading id assignment.

#### Scenario: Standalone id-bearing element follows heading directly

- **WHEN** a heading is followed by an HTML/MDX id-bearing element such as `# Title` then `<a id="hash"></a>` or `<span id="hash"></span>`
- **THEN** linting SHALL report a `doom-lint:heading-anchor-format` violation and instruct replacing the pair with `# Title {#hash}`

#### Scenario: Standalone id-bearing element precedes heading directly

- **WHEN** an HTML/MDX id-bearing element is followed by a heading intended to share the same id target
- **THEN** linting SHALL report a `doom-lint:heading-anchor-format` violation and instruct using heading suffix id syntax

#### Scenario: Standalone id-bearing element follows heading after blank line separation

- **WHEN** a heading is followed by a blank line and then an HTML/MDX id-bearing element such as `<a id="hash"></a>` or `<span id="hash"></span>`
- **THEN** linting SHALL report a `doom-lint:heading-anchor-format` violation and instruct replacing the sequence with `# Title {#hash}`

#### Scenario: Standalone id-bearing element precedes heading after blank line separation

- **WHEN** an HTML/MDX id-bearing element such as `<a id="hash"></a>` or `<span id="hash"></span>` is followed by a blank line and then a heading intended to share the same id target
- **THEN** linting SHALL report a `doom-lint:heading-anchor-format` violation and instruct using heading suffix id syntax

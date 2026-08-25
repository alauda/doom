/**
 * Checks that compare a translation with the source it was made from.
 *
 * Ordinary lint rules read one document; these read two. That is the only thing
 * that separates them, and it is why they live together: the pairing logic and
 * the "say nothing when the pair is not trustworthy" discipline are shared, in
 * `shared.ts`.
 *
 * They are ordinary lint rules in every other respect — same engine, same
 * `<!-- lint disable -->` control, same editor integration — so a translation
 * problem someone notices becomes a rule here, and hand-written documents get
 * the benefit of it too. There is deliberately not a second checking system for
 * translations.
 */
export * from './component-multiset.ts'
export * from './echoed-source.ts'
export * from './frontmatter-preservation.ts'
export * from './heading-sequence.ts'
export * from './jsx-attribute-parity.ts'
export * from './length-ratio.ts'
export * from './link-isomorphism.ts'
export * from './terminology-adherence.ts'
export * from './up-to-date.ts'
export * from './url-residue.ts'

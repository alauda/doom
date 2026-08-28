/**
 * Which JSX attributes carry prose that must reach the translation model.
 *
 * Everything that is **not** listed here is masked before a document is handed
 * to the model (see `cli/translate-mask.ts`). The default is deliberate, and
 * the failure modes are asymmetric:
 *
 * - over-masking leaves a label in the source language — visible and harmless;
 * - under-masking lets an identifier (`Term name`, `K8sAPI name`, an `href`, an
 *   anchor id) be rewritten — silent, and the page breaks.
 *
 * So a component that nobody has classified yet lands on the safe side, and the
 * list below is the only thing that has to be maintained when a component grows
 * a prose-bearing prop.
 *
 * This lives beside the component definitions on purpose: the components are
 * doom's own, so one declaration here is correct for every repository that
 * consumes doom — no per-repository allowlist.
 *
 * Keys are JSX element names as they appear in the document (`Term`, `img`, …).
 */
export const TRANSLATABLE_JSX_ATTRS: Readonly<
  Record<string, readonly string[] | undefined>
> = {
  // "Current behavior", "DR pair requirements" — a rendered callout heading.
  Directive: ['title'],
  // The link text, passed as a prop rather than as children.
  ExternalSiteLink: ['children'],
  // "Web Console", "MySQL" — a rendered tab label.
  Tab: ['label'],
  // Alternative text is prose read by screen readers.
  img: ['alt'],
}

export const isTranslatableJsxAttr = (
  elementName: string | null | undefined,
  attrName: string,
) => !!elementName && !!TRANSLATABLE_JSX_ATTRS[elementName]?.includes(attrName)

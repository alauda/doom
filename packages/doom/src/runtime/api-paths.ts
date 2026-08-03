/**
 * Reading facts off an OpenAPI document's `paths`.
 *
 * Kept free of the `doom-@api-*` virtual modules so it stays importable — and
 * therefore testable — outside a build.
 */

/**
 * Whether an OpenAPI document declares a `/status` subresource route for a
 * resource.
 *
 * A `/status` endpoint exists because the API server routes it, not because the
 * resource's schema happens to carry a `status` property — a property is state,
 * a route is an interface. CRDs say so in `subresources.status`; an OpenAPI
 * document says so by listing the route.
 *
 * Returns `undefined` when the document does not describe the resource's routes
 * at all: it then says nothing about the subresource either, and the caller must
 * fall back to a weaker signal rather than read the silence as a denial.
 */
export const declaresStatusSubresource = (
  paths: string[],
  pluralName: string | undefined,
): boolean | undefined => {
  if (!pluralName) {
    return
  }

  const covers = (path: string) =>
    path.includes(`/${pluralName}/`) || path.endsWith(`/${pluralName}`)

  if (!paths.some(covers)) {
    return
  }

  return paths.some((path) => path.endsWith('/status') && covers(path))
}

import fs from 'node:fs'
import path from 'node:path'

import { baseResolve } from '../../utils/index.ts'

const componentsDir = baseResolve('runtime/components')

/**
 * Whether a file in `runtime/components/` becomes a global MDX component.
 *
 * The filename is the identifier: it is emitted as `import <basename> from …`
 * into every document of every site doom builds. Two consequences, and both
 * have bitten:
 *
 * - the basename must be a valid JS identifier — a hyphen in it is a syntax
 *   error in every document, not a naming nit;
 * - it must start with an uppercase letter, or MDX reads it as an HTML tag.
 *
 * A module that lives here for proximity but is *not* a component — shared
 * constants, helpers — opts out with a `_` prefix, the way `_utils.ts` always
 * has. `test/plugins/global/components.spec.ts` enforces both halves.
 */
export const isGlobalComponentFile = (file: string) => {
  const basename = path.basename(file, path.extname(file))
  return (
    !basename.startsWith('_') &&
    !basename.endsWith('.d') &&
    basename !== 'index'
  )
}

export const getGlobalComponentFiles = () =>
  fs
    .readdirSync(componentsDir)
    .filter(isGlobalComponentFile)
    .map((file) => path.resolve(componentsDir, file))

export const getGlobalComponentNames = () =>
  fs
    .readdirSync(componentsDir)
    .filter(isGlobalComponentFile)
    .map((file) => path.basename(file, path.extname(file)))

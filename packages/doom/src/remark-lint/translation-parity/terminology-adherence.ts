import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { parseTerms } from '../../cli/helpers.ts'
import type { NormalizedTermItem } from '../../terms.ts'

import { collectProseText, currentPair } from './shared.ts'

/**
 * A translation uses the agreed word for an agreed term.
 *
 * The terminology table is already resolved and injected into the translator's
 * prompt for every document, and nothing has ever checked whether the output
 * used it. Turning that into a check costs nothing: same table, read the same
 * way.
 *
 * **Not registered in the default rule set**, and this is why. Run over 1050
 * real pairs it reported 490 problems on a corpus that is substantially
 * correct, because the table is a glossary of preferences rather than a set of
 * invariants: `Application` → `原生应用` fired 124 times, `view` → `视图` 84,
 * `log` → `日志` 39, `NodePort` → `主机端口` 8. Those source words are ordinary
 * English, and their agreed rendering applies to the product feature, not to
 * every sentence that happens to contain the word. A rule that fires 490 times
 * on a healthy corpus does not enforce terminology; it teaches people to
 * disregard the gate.
 *
 * Making it enforceable is an upstream change: the table needs to say which
 * entries are invariants. Until then this is available to run deliberately —
 * `doom lint` with the rule switched on — and is not part of any gate.
 *
 * Matching happens on prose only. `Alauda` inside `security.alauda.io` is an
 * API group, not the company, and a check that cannot tell the difference is a
 * check nobody would keep switched on.
 */
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let termsFailureReported = false

export const translationTerminologyAdherence = lintRule<Root>(
  'doom-lint:translation-terminology-adherence',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair || pair.isCopyOnly) {
      return
    }

    let terms: NormalizedTermItem[]
    try {
      terms = await parseTerms()
    } catch (error) {
      // A check that cannot run must say so. Once per process: the table is
      // fetched once, and one unreadable table is one problem, not nine hundred.
      if (!termsFailureReported) {
        termsFailureReported = true
        vfile.message(
          `Terminology could not be read, so terminology adherence went unchecked in this run: ${error instanceof Error ? error.message : String(error)}`,
          tree,
        )
      }
      return
    }

    const sourceProse = collectProseText(pair.sourceTree)
    const targetProse = collectProseText(tree).toLowerCase()

    for (const term of terms) {
      const source = term[pair.sourceLang as 'en']
      const target = term[pair.targetLang as 'zh' | 'ru']
      if (!source || !target) {
        continue
      }
      const inSource = new RegExp(`\\b${escapeRegExp(source)}\\b`, 'i')
      if (!inSource.test(sourceProse)) {
        continue
      }
      if (targetProse.includes(target.toLowerCase())) {
        continue
      }
      vfile.message(
        `Translation does not use the agreed term for \`${source}\`: expected \`${target}\` somewhere in the prose.`,
        tree,
      )
    }
  },
)

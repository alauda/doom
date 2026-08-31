import doomLint from './remark-lint/index.ts'
import { LINT_RULES, SYNTAX_PLUGINS } from './remark-lint/rule-sets.ts'

export default {
  plugins: [
    ...SYNTAX_PLUGINS,
    // Message control (`<!-- lint disable -->`). It registers its transformer
    // from inside its own attacher, which lands it at the end of the queue, so
    // it filters the messages of every rule regardless of where it sits here.
    doomLint,
    ...LINT_RULES,
  ],
}

import doomLint from './remark-lint/index.ts'
import { LINT_RULES, SYNTAX_PLUGINS } from './remark-lint/rule-sets.ts'

export default {
  plugins: [
    ...SYNTAX_PLUGINS,
    // Message control (`<!-- lint disable -->`). It registers its transformer
    // from inside its own attacher, which lands it at the end of the queue, so
    // it filters the messages of every rule regardless of where it sits here.
    // ESLint applies its own directives, including unused-disable reporting.
    // Only direct remark consumers (such as translation checks) need adaptation.
    [doomLint, { eslint: false }],
    ...LINT_RULES,
  ],
}

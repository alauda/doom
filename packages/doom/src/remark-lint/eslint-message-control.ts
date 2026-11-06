import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visitParents } from 'unist-util-visit-parents'

interface Control {
  action: 'disable' | 'enable' | 'disable-next-line'
  line: number
  column: number
}

/**
 * ESLint's `mdx/remark` selector controls every remark diagnostic. Apply its
 * directives to direct remark consumers using physical source locations;
 * `lint ignore` instead controls a whole node and is not an equivalent for
 * `eslint-disable-next-line` (a blank line or multiline node distinguishes them).
 * Keep these controls independent from `lint` directives so enabling one does
 * not undo an explicit disable in the other.
 */
const eslintMessageControl: Plugin<[], Root> = function () {
  // Attach last, after rules have produced their messages.
  this.use(() => (tree, file) => {
    const controls: Control[] = []
    visitParents(tree, (node) => {
      if (
        (node.type !== 'mdxFlowExpression' &&
          node.type !== 'mdxTextExpression') ||
        !('value' in node) ||
        typeof node.value !== 'string' ||
        !node.position
      ) {
        return
      }
      const value = node.value.trim()
      if (!value.startsWith('/*') || !value.endsWith('*/')) {
        return
      }
      const comment = value.slice(2, -2).trim()
      const separator = comment.search(/\s/)
      const name = separator < 0 ? comment : comment.slice(0, separator)
      const action = name.slice('eslint-'.length)
      if (
        !name.startsWith('eslint-') ||
        (action !== 'disable' &&
          action !== 'enable' &&
          action !== 'disable-next-line')
      ) {
        return
      }
      const attributes = separator < 0 ? '' : comment.slice(separator)
      const rules = attributes
        .split(/\s--\s/)[0]
        .split(/[\s,]+/)
        .filter(Boolean)
      // A bare directive controls every ESLint rule, including mdx/remark.
      if (rules.length && !rules.includes('mdx/remark')) {
        return
      }
      controls.push({
        action,
        line:
          action === 'disable-next-line'
            ? node.position.end.line + 1
            : node.position.start.line,
        column: node.position.start.column,
      })
    })

    file.messages = file.messages.filter((message) => {
      if (
        !message.line ||
        (message.source !== 'doom-lint' && message.source !== 'remark-lint')
      ) {
        return true
      }
      let disabled = false
      for (const control of controls) {
        if (control.action === 'disable-next-line') {
          if (control.line === message.line) {
            return false
          }
        } else if (
          control.line < message.line ||
          (control.line === message.line &&
            control.column <= (message.column ?? 1))
        ) {
          disabled = control.action === 'disable'
        }
      }
      return !disabled
    })
  })
}

export default eslintMessageControl

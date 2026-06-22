import {
  CodeBlock as OriginalCodeBlock,
  copyToClipboard,
  type CodeBlockProps,
} from '@rspress/core/theme-original'
import { useCallback, type MouseEvent } from 'react'

import { AutoExpandable } from './AutoExpandable.js'

const COPIED_CLASS = 'rp-code-copy-button--copied'
const COPY_IGNORE_SELECTOR = '.rp-copy-ignore, .linenumber'

const timeoutIdMap = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>()

const getCopySourceElement = (codeBlockElement: Element | null) =>
  codeBlockElement?.querySelector('pre code') ??
  codeBlockElement?.querySelector('code') ??
  codeBlockElement?.querySelector('pre') ??
  null

const removeIgnoredElements = (element: Element) => {
  for (const ignoredElement of element.querySelectorAll(COPY_IGNORE_SELECTOR)) {
    ignoredElement.remove()
  }
}

export const getCodeBlockCopyText = (codeBlockElement: Element | null) => {
  const sourceElement = getCopySourceElement(codeBlockElement)

  if (!sourceElement) {
    return ''
  }

  const clonedSourceElement = sourceElement.cloneNode(true)

  if (!(clonedSourceElement instanceof Element)) {
    return sourceElement.textContent
  }

  removeIgnoredElements(clonedSourceElement)

  const lines = clonedSourceElement.querySelectorAll('.line')

  if (lines.length) {
    return Array.from(lines, (line) => line.textContent).join('\n')
  }

  return clonedSourceElement.textContent
}

const markCopied = (copyButtonElement: HTMLButtonElement) => {
  copyButtonElement.classList.add(COPIED_CLASS)

  const timeoutId = timeoutIdMap.get(copyButtonElement)

  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  timeoutIdMap.set(
    copyButtonElement,
    setTimeout(() => {
      copyButtonElement.classList.remove(COPIED_CLASS)
      copyButtonElement.blur()
      timeoutIdMap.delete(copyButtonElement)
    }, 2000),
  )
}

const copyCodeBlock = async (
  codeBlockElement: Element | null,
  copyButtonElement: HTMLButtonElement,
) => {
  const text = getCodeBlockCopyText(codeBlockElement)
  const isCopied = await copyToClipboard(text)

  if (isCopied) {
    markCopied(copyButtonElement)
  }
}

export const CodeBlock = (props: CodeBlockProps) => {
  const onClickCapture = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) {
      return
    }

    const copyButtonElement = event.target.closest<HTMLButtonElement>(
      '.rp-code-copy-button',
    )

    if (!copyButtonElement) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    void copyCodeBlock(
      copyButtonElement.closest('.rp-codeblock'),
      copyButtonElement,
    )
  }, [])

  return (
    <AutoExpandable>
      <div onClickCapture={onClickCapture}>
        <OriginalCodeBlock {...props} />
      </div>
    </AutoExpandable>
  )
}

import type { Root } from 'mdast'
import { toString } from 'mdast-util-to-string'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

import { PUNCTUATION_REGEX } from './constants.ts'

const ALLOWED_PUNCTUATIONS = new Set([';', '.'])

export const listItemPunctuation = lintRule<Root>(
  'doom-lint:list-item-punctuation',
  (root, vfile) => {
    visitParents(root, 'list', (list, parents) => {
      const listItems = list.children
      if (listItems.length < 2) {
        return
      }
      const firstItem = listItems[0]
      const last = firstItem.children.at(-1)
      if (last?.type !== 'paragraph' || last.children.at(-1)?.type !== 'text') {
        return
      }
      const firstItemText = toString(firstItem)
      const firstItemLastChar = firstItemText.slice(-1)
      const isPunctuation =
        ![')', ']'].includes(firstItemLastChar) &&
        PUNCTUATION_REGEX.test(firstItemLastChar)
      if (isPunctuation && !ALLOWED_PUNCTUATIONS.has(firstItemLastChar)) {
        vfile.message(
          `Unexpected list item "${firstItemText}" ends with a punctuation mark "${firstItemLastChar}", remove it`,
          {
            ancestors: [...parents, list, firstItem],
            place: firstItem.position,
          },
        )
        return
      }
      const size = listItems.length - 1
      for (const [index, item] of listItems.slice(1).entries()) {
        const last = item.children.at(-1)
        if (
          !last ||
          last.type !== 'paragraph' ||
          last.children.at(-1)?.type !== 'text'
        ) {
          continue
        }
        const text = toString(item)
        const lastChar = text.slice(-1)
        if (isPunctuation) {
          if (index === size - 1) {
            if (lastChar !== '.') {
              if (
                (lastChar === ')' && text.includes('(')) ||
                (lastChar === ']' && text.includes('[')) ||
                text.slice(-2) === '."' ||
                text.slice(-2) === ".'"
              ) {
                continue
              }
              vfile.message(
                `Last list item "${text}" ends with a punctuation mark "${lastChar}" which should be a period (.) instead`,
                {
                  ancestors: [...parents, list, item],
                  place: item.position,
                },
              )
            }
          } else if (lastChar !== firstItemLastChar) {
            vfile.message(
              `list item "${text}" ends with a punctuation mark "${lastChar}", which does not match the first item "${firstItemText}"`,
              {
                ancestors: [...parents, list, item],
                place: item.position,
              },
            )
          }
        } else if (PUNCTUATION_REGEX.test(lastChar)) {
          if (
            (lastChar === ')' && text.includes('(')) ||
            (lastChar === ']' && text.includes('['))
          ) {
            continue
          }
          vfile.message(
            `List item "${text}" ends with a punctuation mark "${lastChar}", remove it`,
            {
              ancestors: [...parents, list, item],
              place: item.position,
            },
          )
        }
      }
    })
  },
)

import type {
  IRangeTransformerOptions,
  ITransformerOptions,
  TLineOptions,
  TPreTransformer,
} from './types.js'

export function createRangeTransformer(
  classMap: Record<string, string | string[]>,
  options: IRangeTransformerOptions = {},
): TPreTransformer {
  return ({ code }: ITransformerOptions) => {
    // https://regex101.com/r/mUxvfx/1
    const tagRE =
      options.tagRegExp ??
      /(?:#|\/\/|\/\*{1,2}) *\[!code ([\w+-]+)(?::(\d+))?] *(?:\*{1,2}\/)?/
    const lineOptions: TLineOptions = []

    const tags = Object.keys(classMap)

    const codeFormat = code
      .split('\n')
      .map((lineOfCode, lineNumber) => {
        const [match, tag, range] = lineOfCode.match(tagRE) ?? []

        if (!match) {
          return lineOfCode
        }

        if (!tags.includes(tag)) {
          return lineOfCode
        }

        for (const [rangeOffset] of Array.from({
          length: Number((range as string | undefined) ?? 1),
        }).entries()) {
          lineOptions.push({
            line: lineNumber + rangeOffset + 1,
            classes:
              typeof classMap[tag] === 'string'
                ? [classMap[tag]]
                : classMap[tag],
          })
        }

        return lineOfCode.replace(tagRE, '')
      })
      .join('\n')

    return {
      code: codeFormat,
      lineOptions,
    }
  }
}

export const checkClass = (code: string, className: string | string[]) => {
  const classes = Array.isArray(className) ? className.join(' ') : className
  return code.search(classes) !== -1
}

export function addClass(
  code: string,
  classes: string | string[],
  tag?: string,
): string {
  const classRE = new RegExp(`<${tag ?? 'w+'}[^>]*class="([\\w+-:;\\/* ]*)"`)
  classes = Array.isArray(classes) ? classes : [classes]
  return code.replace(classRE, (match, previousClasses: string) => {
    return match.replace(
      previousClasses,
      `${previousClasses} ${classes.join(' ')}`.trim(),
    )
  })
}

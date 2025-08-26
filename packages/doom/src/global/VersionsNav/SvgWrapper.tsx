import type { FC, SVGAttributes } from 'react'

/**
 * A wrapper for custom SVG icon.
 * When the user uses a custom SVG, the imported icon can be a string or a React component.
 */
export function SvgWrapper({
  icon: Icon,
  ...rest
}: {
  icon: string | FC<React.SVGProps<SVGSVGElement>>
} & SVGAttributes<SVGSVGElement | HTMLImageElement>) {
  if (!Icon) {
    return null
  }
  if (typeof Icon === 'string') {
    return <img src={Icon} {...rest} />
  }

  return <Icon {...rest} />
}

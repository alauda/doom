import {
  Link as OriginalLink,
  type LinkProps,
} from '@rspress/core/theme-original'

export const Link = (props: LinkProps) => {
  if (
    typeof location !== 'undefined' &&
    props.href?.startsWith(`${location.protocol}//${location.host}`)
  ) {
    return <a {...props} />
  }
  return (
    <OriginalLink
      {...props}
      download={
        // type-coverage:ignore-next-line -- out of control
        props.download == null
          ? props.href?.endsWith('.pdf')
          : // type-coverage:ignore-next-line -- out of control
            (props.download as unknown)
      }
    />
  )
}

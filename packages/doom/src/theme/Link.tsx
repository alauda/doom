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
      download={props.href?.endsWith('.pdf') && props.download !== false}
    />
  )
}

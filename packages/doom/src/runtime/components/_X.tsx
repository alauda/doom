import { withBase } from '@rspress/core/runtime'
import { getCustomMDXComponent } from '@rspress/core/theme-original'
import { isExternalUrl, parseUrl } from '@rspress/shared'
import { clsx } from 'clsx'
import type { ComponentProps } from 'react'

const X_ = getCustomMDXComponent()

const DOWNLOAD_EXTENSIONS = [
  '.ipynb',
  '.zip',
  '.tgz',
  '.tar.gz',
  '.sh',
  '.py',
  '.sql',
]

export const X = {
  ...X_,
  a: (props: ComponentProps<'a'>) => {
    const {
      className,
      href,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      download, // type-coverage:ignore-line
      ...rest
    } = props
    if (href) {
      const { url } = parseUrl(href)
      const pathname = url.split('/').at(-1)!.toLowerCase()
      if (
        download !== false && // type-coverage:ignore-line
        DOWNLOAD_EXTENSIONS.some((ext) => pathname.endsWith(ext))
      ) {
        return (
          <a
            className={clsx('rp-link', className)}
            href={isExternalUrl(href) ? href : withBase(href)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            download={download ?? true}
            {...rest}
          />
        )
      }
    }
    return <X_.a {...props} />
  },
}

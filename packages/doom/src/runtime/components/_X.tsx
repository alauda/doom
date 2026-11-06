import { withBase } from '@rspress/core/runtime'
import { getCustomMDXComponent } from '@rspress/core/theme-original'
import { isExternalUrl } from '@rspress/shared'
import { clsx } from 'clsx'
import type { ComponentProps } from 'react'

import { shouldDownload } from './_download-link.ts'

const X_ = getCustomMDXComponent()

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
      if (shouldDownload(href, download)) {
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

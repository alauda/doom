import { isProduction, NoSSR, useLang } from '@rspress/core/runtime'
import virtual from 'doom-@global-virtual'
import { useState } from 'react'
import { Tooltip } from 'react-tooltip'

import { ACP_BASE } from '../../shared/index.ts'

import { AIAssistant } from './AIAssistant/index.tsx'
import { CloudAuthProvider } from './context.tsx'

import assistantIcon from '@alauda/doom/assets/assistant.svg'
import { useMemoizedFn, useTranslation } from '@alauda/doom/runtime'
import classes from '@alauda/doom/styles/intelligence.module.scss'

const ALLOWED_DOMAINS = new Set(['docs-dev.alauda.cn', 'docs.alauda.io'])

if (!isProduction()) {
  ALLOWED_DOMAINS.add('localhost')
}

const Intelligence_ = () => {
  const t = useTranslation()

  const [open, setOpen] = useState(false)

  const toggleOpen = useMemoizedFn(() => {
    setOpen((prev) => !prev)
  })

  return (
    <CloudAuthProvider>
      <AIAssistant open={open} onOpenChange={toggleOpen} />
      {open || (
        <button type="button" className={classes.entry} onClick={toggleOpen}>
          <img alt={t('ai_assistant')} src={assistantIcon} />
        </button>
      )}
      <Tooltip anchorSelect={`.${classes.entry}`} place="left">
        {t('ai_assistant')}
      </Tooltip>
    </CloudAuthProvider>
  )
}

const Intelligence = () => {
  const lang = useLang()

  if (
    lang !== 'en' ||
    !ALLOWED_DOMAINS.has(location.hostname) ||
    virtual.userBase !== ACP_BASE
  ) {
    return
  }

  return <Intelligence_ />
}

export default () => (
  <NoSSR>
    <Intelligence />
  </NoSSR>
)

import { isProduction, NoSSR } from '@rspress/core/runtime'
import { useState } from 'react'
import { Tooltip } from 'react-tooltip'

import { AIAssistant } from './AIAssistant/index.tsx'

import assistantIcon from '@alauda/doom/assets/assistant.svg'
import { useMemoizedFn, useTranslation } from '@alauda/doom/runtime'

const ALLOWED_DOMAINS = new Set([
  'docs-dev.alauda.cn',
  'docs.alauda.cn',
  'docs.alauda.io',
])

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
    <>
      <AIAssistant open={open} onOpenChange={toggleOpen} />
      {open || (
        <button
          type="button"
          className="intelligence-entry"
          onClick={toggleOpen}
        >
          <img alt={t('ai_assistant')} src={assistantIcon} />
        </button>
      )}
      <Tooltip anchorSelect=".intelligence-entry" place="left">
        {t('ai_assistant')}
      </Tooltip>
    </>
  )
}

const Intelligence = () => {
  if (!ALLOWED_DOMAINS.has(location.hostname)) {
    return
  }

  return <Intelligence_ />
}

export default () => (
  <NoSSR>
    <Intelligence />
  </NoSSR>
)

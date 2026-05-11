import { Markdown, useTranslation } from '@alauda/doom/runtime'
import classes from '@alauda/doom/styles/chat.module.scss'

export interface ThinkingProcessProps {
  children: string
}

export const ThinkingProcess = ({ children }: ThinkingProcessProps) => {
  const t = useTranslation()
  return (
    <div>
      <div>{t('thinking_process')}</div>
      <div className={classes.markdown}>
        <Markdown>{children}</Markdown>
      </div>
    </div>
  )
}

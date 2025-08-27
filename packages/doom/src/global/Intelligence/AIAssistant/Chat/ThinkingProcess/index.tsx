import { Markdown, useTranslation } from '@alauda/doom/runtime'

export interface ThinkingProcessProps {
  children: string
}

export const ThinkingProcess = ({ children }: ThinkingProcessProps) => {
  const t = useTranslation()
  return (
    <div>
      <div>{t('thinking_process')}</div>
      <Markdown>{children}</Markdown>
    </div>
  )
}

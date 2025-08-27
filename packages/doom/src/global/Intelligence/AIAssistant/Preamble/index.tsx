import { clsx } from 'clsx'

import { LoginForm } from './LoginForm/index.tsx'

import AssistantIcon from '@alauda/doom/assets/assistant.svg?react'
import { useTranslation } from '@alauda/doom/runtime'
import classes from '@alauda/doom/styles/preamble.module.scss'

export interface PreambleProps {
  loggedIn: boolean
}

export const Preamble = ({ loggedIn }: PreambleProps) => {
  const t = useTranslation()

  return (
    <div className={clsx(classes.preamble, loggedIn && classes.loggedIn)}>
      <AssistantIcon width={48} height={40} />
      <div className={classes.title}>
        {t(loggedIn ? 'hi_there' : 'user_login')}
      </div>
      <div className={classes.content}>
        {t(loggedIn ? 'ai_assistant_tip' : 'user_login_tip')}
      </div>
      {loggedIn || <LoginForm className={classes.form} />}
    </div>
  )
}

import { clsx } from 'clsx'

import { LoginForm } from '../../../../login/LoginForm/index.tsx'
import { getCloudOrigin, isIoSite } from '../../../../login/utils.ts'
import { X } from '../../../../runtime/components/_X.tsx'

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
      <div className={`rp-doc ${classes.content}`}>
        {loggedIn ? (
          t('ai_assistant_tip')
        ) : (
          <>
            {t('user_login_tip1')}
            <X.a href={getCloudOrigin()}>
              {t(`customer_portal_${isIoSite() ? 'global' : 'china'}`)}
            </X.a>
            {t('user_login_tip2')}
          </>
        )}
      </div>
      {loggedIn || <LoginForm className={classes.form} />}
    </div>
  )
}

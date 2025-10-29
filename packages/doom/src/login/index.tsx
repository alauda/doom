import { NoSSR, useSearchParams } from '@rspress/core/runtime'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { X } from '../runtime/components/_X.tsx'
import { useTranslation } from '../runtime/index.ts'

import { LoginForm } from './LoginForm/index.tsx'
import { getCloudOrigin, isIoSite } from './utils.ts'

import bg from '@alauda/doom/assets/login-bg.svg'
import classes from '@alauda/doom/styles/login.module.scss'

const Login = () => {
  const navigate = useNavigate()
  const [query] = useSearchParams()
  const from = query.get('from')
  const onLoggedIn = useCallback(() => {
    navigate(from || '/')
  }, [from, navigate])
  const t = useTranslation()
  return (
    <div
      className={classes.container}
      style={{ background: `no-repeat 0 100px url(${bg})` }}
    >
      <div className={classes.loginForm}>
        <div className={classes.title}>{t('user_login')}</div>
        <div className={classes.content}>
          {t('user_login_tip1')}
          <X.a href={getCloudOrigin()}>
            {t(`customer_portal_${isIoSite() ? 'global' : 'china'}`)}
          </X.a>
          {t('user_login_tip2')}
        </div>
        <LoginForm onLoggedIn={onLoggedIn} />
      </div>
    </div>
  )
}

export default () => (
  <NoSSR>
    <Login />
  </NoSSR>
)

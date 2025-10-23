import { NoSSR, useSearchParams } from '@rspress/core/runtime'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { LoginForm } from './LoginForm/index.tsx'

import classes from '@alauda/doom/styles/login.module.scss'

const Login = () => {
  const navigate = useNavigate()
  const [query] = useSearchParams()
  const from = query.get('from')
  const onLoggedIn = useCallback(() => {
    navigate(from || '/')
  }, [from, navigate])
  return (
    <div className={classes.container}>
      <LoginForm onLoggedIn={onLoggedIn} />
    </div>
  )
}

export default () => (
  <NoSSR>
    <Login />
  </NoSSR>
)

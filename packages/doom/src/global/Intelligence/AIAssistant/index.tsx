import { consumeSmartDocDisplayStream } from '@alauda/doc-stream-sdk'
import { clsx } from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import {
  ApiMethod,
  interceptors,
  ResponseError,
  xfetch,
  type ApiInterceptor,
} from 'x-fetch'

import { getCloudAuth, useCloudAuth } from '../../../login/store.ts'
import { getCloudOrigin, isLoggedIn } from '../../../login/utils.ts'

import { Chat } from './Chat/index.tsx'
import { Preamble } from './Preamble/index.tsx'
import { ResizableUserInput } from './ResizableUserInput/index.tsx'
import { Thinking } from './Thinking.tsx'
import type { ChatMessage } from './types.ts'

import CloseIcon from '@alauda/doom/assets/close.svg?react'
import LogoutIcon from '@alauda/doom/assets/logout.svg?react'
import NewChatIcon from '@alauda/doom/assets/new-chat.svg?react'
import { useMemoizedFn, useTranslation } from '@alauda/doom/runtime'
import classes from '@alauda/doom/styles/ai-assistant.module.scss'

export interface AIAssistantProps {
  open?: boolean
  onOpenChange: (open: boolean) => void
  onCleanup?: () => void
}

export const AIAssistant = ({ open, onOpenChange }: AIAssistantProps) => {
  const t = useTranslation()

  const { authInfo, setAuthBasic } = useCloudAuth()

  const loggedIn = isLoggedIn(authInfo)

  const sessionIdRef = useRef<number>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])

  const chatRef = useRef<HTMLUListElement>(null)

  const onNewChat = useMemoizedFn(() => {
    sessionIdRef.current = null
    setMessages([])
  })

  const onLogout = useMemoizedFn(() => {
    setAuthBasic()
    onNewChat()
  })

  useEffect(() => {
    const interceptor: ApiInterceptor = async (req, next) => {
      if (!req.url.startsWith('/smart/')) {
        return next(req)
      }
      if (!req.headers.has('Authorization')) {
        req.headers.set('Authorization', `Bearer ${authInfo!.token}`)
      }
      if (!req.headers.has('CLOUD_AUTH_ORIGIN')) {
        req.headers.set('CLOUD_AUTH_ORIGIN', getCloudOrigin())
      }
      try {
        return await next(req)
      } catch (err) {
        if (
          err instanceof ResponseError &&
          // type-coverage:ignore-next-line -- no idea
          err.response.status === 401
        ) {
          onLogout()
        }
        throw err
      }
    }
    interceptors.use(interceptor)
    return () => {
      interceptors.eject(interceptor)
    }
  }, [authInfo, onLogout])

  const onClose = useMemoizedFn(() => {
    onOpenChange(false)
  })

  const flushMessages = useMemoizedFn(
    (setMessagesAction: (messages: ChatMessage[]) => ChatMessage[]) => {
      setMessages(setMessagesAction)
      setTimeout(() => {
        const chatEl = chatRef.current
        if (!chatEl) {
          return
        }
        chatEl.scrollTop = chatEl.scrollHeight
      }, 200)
    },
  )

  const assistantMessageIndexRef = useRef<number>(-1)

  const onSend_ = async (content: string) => {
    const assistantMessage: ChatMessage = {
      id: Date.now(),
      role: 'assistant' as const,
      content: <Thinking />,
    }

    const index = (assistantMessageIndexRef.current = messages.length + 1)

    flushMessages((messages) => [
      ...messages,
      { id: Date.now(), role: 'user' as const, content },
      assistantMessage,
    ])

    if (!sessionIdRef.current) {
      const { session_id } = await xfetch<{ session_id: number }>(
        '/smart/api/new_session',
        {
          method: ApiMethod.POST,
        },
      )
      sessionIdRef.current = session_id
    }

    const sessionId = sessionIdRef.current

    const res = await xfetch('/smart/api/smart_answer_with_search', {
      type: null,
      method: ApiMethod.POST,
      body: {
        input_text: content,
        session_id: sessionId,
      },
    })

    const syncAssistantMessage = (nextMessage: {
      content: string
      thoughtProcess: string
      refDocs: ChatMessage['refDocs']
    }) => {
      if (sessionId !== sessionIdRef.current) {
        return
      }

      flushMessages((messages) => [
        ...messages.slice(0, index),
        {
          ...messages[index],
          content: nextMessage.content,
          thoughtProcess: nextMessage.thoughtProcess || undefined,
          refDocs: nextMessage.refDocs,
        },
        ...messages.slice(index + 1),
      ])
    }

    await consumeSmartDocDisplayStream(
      res.body! as ReadableStream<Uint8Array | string>,
      {
        ignoreDocsBlocks: false,
        onDisplayMessage(displayMessage) {
          syncAssistantMessage(displayMessage)
        },
      },
    )
  }

  const [loading, setLoading] = useState(false)

  const onSend = useMemoizedFn(async (content: string) => {
    setLoading(true)
    try {
      await onSend_(content)
    } catch {
      if (!isLoggedIn(getCloudAuth())) {
        return
      }
      flushMessages((messages) => {
        const index = assistantMessageIndexRef.current
        return [
          ...messages.slice(0, index),
          { ...messages[index], content: t('NetworkError') },
          ...messages.slice(index + 1),
        ]
      })
    } finally {
      setLoading(false)
    }
  })

  return (
    <div
      className={clsx(classes.container, 'rspress-doc', open && classes.open)}
    >
      <div className={classes.header}>
        <div className={classes.title}>
          {t('ai_assistant')}
          {loggedIn && (
            <>
              <span className={classes.username}>
                ({authInfo.detail.user.name})
              </span>
              <LogoutIcon className="ai-assistant-logout" onClick={onLogout} />
              <Tooltip anchorSelect=".ai-assistant-logout">
                {t('logout')}
              </Tooltip>
            </>
          )}
        </div>
        <div className={classes.icons}>
          {messages.length ? (
            <>
              <NewChatIcon
                className="ai-assistant-new-chat"
                onClick={onNewChat}
              />
              <Tooltip anchorSelect=".ai-assistant-new-chat">
                {t('new_chat')}
              </Tooltip>
            </>
          ) : null}
          <CloseIcon className="ai-assistant-close" onClick={onClose} />
          <Tooltip anchorSelect=".ai-assistant-close">{t('close')}</Tooltip>
        </div>
      </div>
      {messages.length ? (
        <Chat ref={chatRef} messages={messages} />
      ) : (
        <Preamble loggedIn={loggedIn} />
      )}
      {loggedIn && <ResizableUserInput loading={loading} onSend={onSend} />}
    </div>
  )
}

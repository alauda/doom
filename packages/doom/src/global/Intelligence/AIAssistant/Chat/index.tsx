import { clsx } from 'clsx'
import type { Ref } from 'react'

import type { ChatMessage } from '../types.js'

import { ChatRefDocs } from './ChatRefDocs/index.js'
import { ThinkingProcess } from './ThinkingProcess/index.js'

import AssistantIcon from '@alauda/doom/assets/assistant.svg?react'
import { Markdown } from '@alauda/doom/runtime'
import classes from '@alauda/doom/styles/chat.module.scss'

export interface ChatProps {
  ref?: Ref<HTMLUListElement>
  messages: ChatMessage[]
}

export const Chat = ({ ref, messages }: ChatProps) => (
  <ul ref={ref} className={classes.container}>
    {messages.map(({ id, role, content, thinkingProcess, refDocs }) => (
      <li key={`${role}-${id}`} className={clsx(classes.chat, classes[role])}>
        {role === 'assistant' && <AssistantIcon className={classes.icon} />}
        <div className={classes.content}>
          {thinkingProcess && (
            <ThinkingProcess>{thinkingProcess}</ThinkingProcess>
          )}
          {refDocs?.length ? <ChatRefDocs refDocs={refDocs} /> : null}
          {typeof content === 'string' ? (
            <Markdown>{content}</Markdown>
          ) : (
            content
          )}
        </div>
      </li>
    ))}
  </ul>
)

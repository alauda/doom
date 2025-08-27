import { useState } from 'react'

import { useInterval, useTranslation } from '@alauda/doom/runtime'

const CHUNKS = ['', '.', '..', '...']

const CHUNKS_LENGTH = CHUNKS.length

export const Thinking = () => {
  const t = useTranslation()

  const [index, setIndex] = useState(0)

  useInterval(() => {
    setIndex((index) => {
      const nextIndex = index + 1
      return nextIndex === CHUNKS_LENGTH ? 0 : nextIndex
    })
  }, 250)

  return `${t('thinking')}${CHUNKS[index]}`
}

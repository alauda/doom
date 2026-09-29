import { NoSSR, usePage } from '@rspress/core/runtime'
import { useState } from 'react'

import {
  FEEDBACK_REASONS,
  type FeedbackReason,
} from '../../analytics/shared.ts'
import { resolveAnalyticsTarget, track } from '../../analytics/tracker.ts'
import { useTranslation } from '../../runtime/index.ts'

type Stage = 'ask' | 'reasons' | 'done'

const Feedback_ = () => {
  const t = useTranslation()
  const [stage, setStage] = useState<Stage>('ask')
  const [reasons, setReasons] = useState<FeedbackReason[]>([])

  const toggleReason = (reason: FeedbackReason) => {
    setReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason],
    )
  }

  if (stage === 'done') {
    return (
      <div className="doom-feedback">
        <p className="doom-feedback__thanks">{t('feedback_thanks')}</p>
      </div>
    )
  }

  return (
    <div className="doom-feedback">
      <div className="doom-feedback__ask">
        <span>{t('feedback_question')}</span>
        <button
          type="button"
          className="doom-feedback__vote"
          disabled={stage === 'reasons'}
          onClick={() => {
            track({ name: 'docs_feedback', vote: 'up', reasons: [] })
            setStage('done')
          }}
        >
          👍 {t('feedback_yes')}
        </button>
        <button
          type="button"
          className="doom-feedback__vote"
          aria-pressed={stage === 'reasons'}
          onClick={() => {
            setStage('reasons')
          }}
        >
          👎 {t('feedback_no')}
        </button>
      </div>
      {stage === 'reasons' && (
        <fieldset className="doom-feedback__reasons">
          <legend>{t('feedback_reasons_title')}</legend>
          {FEEDBACK_REASONS.map((reason) => (
            <label key={reason}>
              <input
                type="checkbox"
                checked={reasons.includes(reason)}
                onChange={() => {
                  toggleReason(reason)
                }}
              />
              {t(`feedback_reason_${reason}`)}
            </label>
          ))}
          <button
            type="button"
            className="doom-feedback__submit"
            disabled={reasons.length === 0}
            onClick={() => {
              track({ name: 'docs_feedback', vote: 'down', reasons })
              setStage('done')
            }}
          >
            {t('feedback_submit')}
          </button>
        </fieldset>
      )}
    </div>
  )
}

const FeedbackGate = () => {
  const { page } = usePage()
  // Only where we can actually record the answer: offline installs, previews
  // and excluded sites never show a button that does nothing.
  if (page.pageType !== 'doc' || !resolveAnalyticsTarget()) {
    return null
  }
  return <Feedback_ />
}

export const Feedback = () =>
  process.env.DOOM_ANALYTICS ? (
    <NoSSR>
      <FeedbackGate />
    </NoSSR>
  ) : null

import { pRateLimit } from 'p-ratelimit'

/**
 * How hard a translation run is allowed to drive the gateway.
 *
 * Its own module rather than part of the command: the command reads config and
 * walks files, while this is one small unit with an exact contract, and the
 * only part of the pair worth testing on its own.
 */

export const CONCURRENCY_ENV = 'ALAUDA_OPENAI_CONCURRENCY'
export const REQUESTS_PER_MINUTE_ENV = 'ALAUDA_OPENAI_REQUESTS_PER_MINUTE'

/** How many documents are translated at once. */
export const DEFAULT_CONCURRENCY = 2

/** How many model requests a minute the gateway is asked to take. */
export const DEFAULT_REQUESTS_PER_MINUTE = 25

/**
 * Reads a positive integer from the environment, or fails naming the variable.
 *
 * Falling back to the default on a malformed value would be the worst of the
 * three outcomes: the run is not what was asked for, and nothing says so. A
 * gateway budget set to `twenty` is a mistake worth stopping for.
 */
export const positiveIntFromEnv = (name: string, fallback: number) => {
  const raw = process.env[name]
  if (raw == null || raw === '') {
    return fallback
  }
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(
      `\`${name}\` must be a whole number of at least 1, and is \`${raw}\`.`,
    )
  }
  return value
}

/**
 * The two limits a run is given, and the one number each of them means.
 *
 * `concurrency` bounds documents in flight *and* model calls in flight. They
 * are one knob rather than two because "how many translations are running" is
 * what a gateway feels, and two numbers that mean nearly the same thing drift
 * apart. The cost is internal queueing — the judge's two draws take their turn
 * instead of going out together — which slows a document down without changing
 * what it produces.
 *
 * `requestsPerMinute` is the budget the gateway is protected by. It counts
 * calls, not documents: the loop makes as many as a document needs, and the
 * extra turns an agent takes count against the same budget rather than
 * slipping past it.
 */
export const createLimits = ({
  concurrency,
  requestsPerMinute,
}: {
  concurrency: number
  requestsPerMinute: number
}) => ({
  modelCallLimit: pRateLimit({
    interval: 60_000, // 1min
    rate: requestsPerMinute,
    concurrency,
  }),
  documentLimit: pRateLimit({ concurrency }),
})

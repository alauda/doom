import type { Model, Models, ThinkingLevel } from '@earendil-works/pi-ai'

/**
 * The translation gateway, described to pi.
 *
 * The gateway is an OpenAI-compatible endpoint reached through
 * `ALAUDA_OPENAI_BASE_URL` / `ALAUDA_OPENAI_API_KEY`, which is how
 * `doom translate` has always reached it. pi wants a provider and a model
 * object rather than a base url and a model name, so this builds them.
 */

export const GATEWAY_PROVIDER_ID = 'alauda'

/** The default translator model. Measured against this gateway; see the proposal's §5.4. */
export const DEFAULT_TRANSLATE_MODEL = 'gpt-5.6'

export const DEFAULT_REASONING_EFFORT: ThinkingLevel = 'low'

/**
 * How much of the model's context we plan for.
 *
 * Deliberately conservative, and deliberately not the number the gateway
 * reports. A context window is a property of one model on one gateway on one
 * day: reading it once and building on it is how the previous design talked
 * itself out of segmenting documents at all. Planning for less than we have
 * costs a few extra reads; planning for more than we have loses content.
 */
export const DEFAULT_CONTEXT_WINDOW = 128_000

/**
 * The cap pi puts on a single response.
 *
 * pi always sends one (`options.maxTokens ?? model.maxTokens`), where the old
 * single-shot translator sent none. That is a real difference in behaviour, so
 * it is a named number rather than an incidental one — and it is not the thing
 * keeping long documents intact. The agent writes a long translation in
 * segments, and a response cut short leaves placeholders unaccounted for,
 * which the mask assertions report.
 */
export const DEFAULT_MAX_OUTPUT_TOKENS = 32_000

/**
 * What the gateway calls each reasoning level.
 *
 * Measured against the real gateway: the vocabulary is
 * `none / low / medium / high / xhigh / max`. It has no `minimal` — passing one
 * is a 400 — so that level is marked unsupported and pi clamps to the next one
 * it does have.
 */
const GATEWAY_THINKING_LEVELS = {
  off: 'none',
  minimal: null,
  low: 'low',
  medium: 'medium',
  high: 'high',
  xhigh: 'xhigh',
  max: 'max',
} as const

export interface GatewayModelOptions {
  id: string
  baseUrl: string
  contextWindow?: number
  maxOutputTokens?: number
}

export const gatewayModel = ({
  id,
  baseUrl,
  contextWindow = DEFAULT_CONTEXT_WINDOW,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
}: GatewayModelOptions): Model<'openai-completions'> => ({
  id,
  name: id,
  api: 'openai-completions',
  provider: GATEWAY_PROVIDER_ID,
  baseUrl,
  reasoning: true,
  thinkingLevelMap: { ...GATEWAY_THINKING_LEVELS },
  input: ['text'],
  // Billing for this gateway is not per-request, and nothing here reads cost.
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow,
  maxTokens: maxOutputTokens,
  compat: {
    // Stated rather than detected: detection keys off the base url, and this
    // one is an internal host pi has never seen. All four were checked against
    // the real gateway.
    supportsStore: false,
    supportsDeveloperRole: false,
    supportsReasoningEffort: true,
    maxTokensField: 'max_completion_tokens',
  },
})

export class MissingGatewayCredentialsError extends Error {
  constructor(missing: readonly string[]) {
    super(
      `Cannot translate: ${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} not set. ` +
        'They point `doom translate` at the translation gateway.',
    )
    this.name = 'MissingGatewayCredentialsError'
  }
}

export const API_KEY_ENV = 'ALAUDA_OPENAI_API_KEY'
export const BASE_URL_ENV = 'ALAUDA_OPENAI_BASE_URL'

export interface Gateway {
  models: Models
  model: Model<'openai-completions'>
  baseUrl: string
}

export interface CreateGatewayOptions {
  modelId?: string
  contextWindow?: number
  maxOutputTokens?: number
}

/**
 * Wires the gateway up as a pi provider.
 *
 * Fails immediately and by name when a credential is missing. The alternative
 * — discovering it one stream error at a time, once per file — is how a
 * misconfigured run turns into a wall of unrelated failures.
 */
export const createGateway = async ({
  modelId = process.env.ALAUDA_OPENAI_MODEL || DEFAULT_TRANSLATE_MODEL,
  contextWindow,
  maxOutputTokens,
}: CreateGatewayOptions = {}): Promise<Gateway> => {
  const baseUrl = process.env[BASE_URL_ENV]
  const missing = [
    process.env[API_KEY_ENV] ? undefined : API_KEY_ENV,
    baseUrl ? undefined : BASE_URL_ENV,
  ].filter((name): name is string => !!name)
  if (missing.length > 0 || !baseUrl) {
    throw new MissingGatewayCredentialsError(missing)
  }

  const [
    { createModels, createProvider, envApiKeyAuth },
    { openAICompletionsApi },
  ] = await Promise.all([
    import('@earendil-works/pi-ai'),
    import('@earendil-works/pi-ai/api/openai-completions.lazy'),
  ])

  const model = gatewayModel({
    id: modelId,
    baseUrl,
    contextWindow,
    maxOutputTokens,
  })

  const models = createModels()
  models.setProvider(
    createProvider({
      id: GATEWAY_PROVIDER_ID,
      name: 'Alauda translation gateway',
      baseUrl,
      auth: {
        apiKey: envApiKeyAuth('Alauda translation gateway', [API_KEY_ENV]),
      },
      models: [model],
      api: openAICompletionsApi(),
    }),
  )

  return { models, model, baseUrl }
}

import type { CloudAuthRegion } from './types.js'

export const CLOUD_AUTH_ORIGIN_KEY = '__CLOUD_AUTH_ORIGIN__'
export const CLOUD_AUTH_TOKEN_KEY = '__CLOUD_AUTH_TOKEN__'

const CLOUD_AUTH_ORIGINS: CloudAuthRegion[] = [
  {
    name: 'global',
    value: 'https://cloud.alauda.io',
  },
  {
    name: 'china',
    value: 'https://cloud.alauda.cn',
  },
]

export const CLOUD_AUTH_ORIGIN_VALUES = CLOUD_AUTH_ORIGINS.map(
  ({ value }) => value,
)

export { CLOUD_AUTH_ORIGINS }

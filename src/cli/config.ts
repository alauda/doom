import type { UserConfig } from '@rspress/core'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DoomConfig extends UserConfig {}

export const defineConfig = (config: DoomConfig) => config

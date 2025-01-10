export interface DoomSite {
  name: string
  base: string
  version: string
  displayName?: Record<string, string>
  repo?: string
  image?: string
}

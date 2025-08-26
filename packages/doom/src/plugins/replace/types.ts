import type { ContentProcessor } from '../../types.js'

export interface ReferenceItemSource {
  name: string
  path: string
  ignoreHeading?: boolean
  /**
   * @default 'ignore'
   */
  frontmatterMode?: 'ignore' | 'merge' | 'remove' | 'replace'
  processors?: ContentProcessor[]
}

export interface ReferenceItemRemote {
  repo?: string
  branch?: string
  publicBase?: string
}

export interface ReferenceItem extends ReferenceItemRemote {
  sources: ReferenceItemSource[]
}

export interface NormalizedReferenceSource
  extends ReferenceItemRemote,
    ReferenceItemSource {
  anchor?: string
}

export interface ReleaseNotesOptions {
  queryTemplates: Record<string, string>
}

export interface JiraIssue {
  expand: string
  id: string
  self: string
  key: string
  fields: Partial<Record<string, string>>
}

export type JiraLanguage = 'zh' | 'en'

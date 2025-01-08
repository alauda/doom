import { ContentProcessor } from '../../utils/types.js'

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

export interface ReferenceItem {
  repo?: string
  sources: ReferenceItemSource[]
}

export interface NormalizedReferenceSource extends ReferenceItemSource {
  repo?: string
  slug?: string
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

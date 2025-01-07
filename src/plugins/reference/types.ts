export interface ReferenceItemSource {
  name: string
  path: string
  ignoreHeading?: boolean
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

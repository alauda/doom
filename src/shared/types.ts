import type { UNVERSIONED } from './constants.js'

export interface DoomSite {
  name: string
  base: string
  version: string
  displayName?: Record<string, string>
  repo?: string
  image?: string
}

export type StringMapper = Record<string, string>

export interface K8sObjectMeta {
  annotations: StringMapper
  name: string
}

export interface K8sTypeMeta {
  apiVersion: string
  kind: string
  metadata: K8sObjectMeta
}

export interface K8sTypeList<T extends K8sTypeMeta> extends K8sTypeMeta {
  items: T[]
}

export type UnversionedVersion =
  | typeof UNVERSIONED
  | `${typeof UNVERSIONED}-${string}`

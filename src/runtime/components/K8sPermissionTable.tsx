import { useLang } from '@rspress/core/runtime'
import { getCustomMDXComponent } from '@rspress/core/theme'
import { intersection, sortBy } from 'es-toolkit'
import { Fragment, useMemo, useState } from 'react'

import type {
  FunctionResource,
  RoleTemplate,
  RoleTemplateRuleVerb,
} from '../../plugins/index.js'
import { useTranslation } from '../hooks/index.js'

import functionResourcesMap from 'doom-@permission-functionResourcesMap'
import roleTemplatesMap from 'doom-@permission-roleTemplatesMap'

export interface K8sPermissionTableProps {
  functions: string[]
}

export const VerbsMap = {
  view: ['get', 'list', 'watch'],
  create: ['create'],
  update: ['update', 'patch'],
  delete: ['delete', 'deletecollection'],
} as const

export type Verb = keyof typeof VerbsMap

export const Verbs = Object.keys(VerbsMap) as Verb[]

const FUNCTION_DISPLAY_NAME_ZH =
  'cpaas.io/functionresource.function.display-name'
const FUNCTION_DISPLAY_NAME_EN =
  'cpaas.io/functionresource.function.display-name.en'

const DISPLAY_NAME_ZH = 'cpaas.io/display-name'
const DISPLAY_NAME_EN = 'cpaas.io/display-name.en'

const TEXT_CENTER_STYLE = { textAlign: 'center' } as const
const TEXT_NO_WRAP_STYLE = { whiteSpace: 'nowrap' } as const

const RolesPermission = ({
  functionResource,
  roleTemplates,
  verb,
}: {
  functionResource: FunctionResource
  roleTemplates: RoleTemplate[]
  verb: Verb
}) => {
  const [X] = useState(getCustomMDXComponent)
  const functionResourceName = functionResource.metadata.name
  const actions = functionResource.metadata.annotations['auth.cpaas.io/actions']
  return roleTemplates.map(({ metadata: { name }, spec: { rules } }) => {
    const found = rules.find((r) =>
      ['*', functionResourceName].includes(r.functionResourceRef),
    )
    let hasPermission = false
    if (found) {
      let verbs: RoleTemplateRuleVerb[]

      if (actions) {
        const actionsVerbs = actions.split(',') as RoleTemplateRuleVerb[]
        if (found.verbs.includes('*')) {
          verbs = actionsVerbs
        } else {
          verbs = intersection(found.verbs, actionsVerbs)
        }
      } else {
        verbs = found.verbs
      }

      if (
        verbs.includes('*') ||
        VerbsMap[verb].every((v) => verbs.includes(v))
      ) {
        hasPermission = true
      }
    }
    return (
      <X.td key={name} style={TEXT_CENTER_STYLE}>
        {hasPermission ? '✓' : '✕'}
      </X.td>
    )
  })
}

export const K8sPermissionTable = ({ functions }: K8sPermissionTableProps) => {
  const [X] = useState(getCustomMDXComponent)

  const allFunctionResources = useMemo(
    () =>
      Object.values(functionResourcesMap).reduce<
        Partial<Record<string, FunctionResource>>
      >(
        (acc, curr) =>
          Object.assign(
            acc,
            ...curr.map((fr) => ({ [fr.metadata.name]: fr })),
          ) as Partial<Record<string, FunctionResource>>,
        {},
      ),
    [],
  )

  const functionResources = useMemo(() => {
    return functions.flatMap((name) => {
      const matched = allFunctionResources[name]
      if (!matched) {
        console.error(`FunctionResource \`${name}\` not found!\n`)
        return []
      }
      return matched
    })
  }, [...functions])

  const roleTemplates = useMemo(
    () =>
      sortBy(Object.values(roleTemplatesMap).flat(), [
        (it) => it.metadata.annotations['auth.cpaas.io/role.id'],
      ]),
    [],
  )

  const t = useTranslation()

  const lang = useLang()

  const isZh = lang === 'zh'

  return (
    <X.table>
      <thead>
        <X.tr>
          <X.th>{t('function')}</X.th>
          <X.th style={TEXT_NO_WRAP_STYLE}>{t('action')}</X.th>
          {roleTemplates.map(({ metadata: { annotations, name } }) => (
            <X.th key={name}>
              {isZh
                ? annotations[DISPLAY_NAME_ZH]
                : annotations[DISPLAY_NAME_EN]}
            </X.th>
          ))}
        </X.tr>
      </thead>
      <tbody>
        {functionResources.map((fr) => {
          const {
            metadata: { annotations, name },
          } = fr
          return (
            <Fragment key={name}>
              <X.tr>
                <X.td rowSpan={4} style={TEXT_CENTER_STYLE}>
                  {isZh
                    ? annotations[FUNCTION_DISPLAY_NAME_ZH]
                    : annotations[FUNCTION_DISPLAY_NAME_EN]}
                  <br />
                  <code>{name}</code>
                </X.td>
                <X.td>{t('view')}</X.td>
                <RolesPermission
                  functionResource={fr}
                  roleTemplates={roleTemplates}
                  verb="view"
                />
              </X.tr>
              {Verbs.slice(1).map((verb) => (
                <X.tr key={verb}>
                  <X.td>{t(verb)}</X.td>
                  <RolesPermission
                    functionResource={fr}
                    roleTemplates={roleTemplates}
                    verb={verb}
                  />
                </X.tr>
              ))}
            </Fragment>
          )
        })}
      </tbody>
    </X.table>
  )
}

export default K8sPermissionTable

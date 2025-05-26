import { CodeBlockRuntime, Tab, Tabs } from '@rspress/core/theme'
import type { JsonValue } from 'type-fest'
import { stringify } from 'yaml'

export interface JsonViewerProps {
  value: JsonValue
}

export const JsonViewer = ({ value }: JsonViewerProps) => {
  return (
    <Tabs>
      <Tab label="yaml">
        {/* @ts-expect-error -- https://github.com/web-infra-dev/rspress/pull/2205 */}
        <CodeBlockRuntime lang="yaml" code={stringify(value)} />
      </Tab>
      <Tab label="json">
        {/* @ts-expect-error -- https://github.com/web-infra-dev/rspress/pull/2205 */}
        <CodeBlockRuntime lang="json" code={JSON.stringify(value, null, 2)} />
      </Tab>
    </Tabs>
  )
}

export default JsonViewer

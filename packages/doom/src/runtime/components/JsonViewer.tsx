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
        <CodeBlockRuntime lang="yaml" code={stringify(value)} />
      </Tab>
      <Tab label="json">
        <CodeBlockRuntime lang="json" code={JSON.stringify(value, null, 2)} />
      </Tab>
    </Tabs>
  )
}

export default JsonViewer

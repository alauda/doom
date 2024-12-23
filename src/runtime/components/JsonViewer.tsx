import { getCustomMDXComponent, Tab, Tabs } from '@rspress/core/theme'
import type { JsonValue } from 'type-fest'
import { stringify } from 'yaml'

export interface JsonViewerProps {
  value: JsonValue
}

const X = getCustomMDXComponent()

export const JsonViewer = ({ value }: JsonViewerProps) => {
  return (
    <Tabs>
      <Tab label="yaml">
        <X.pre>
          <X.code className="language-yaml" codeHighlighter="prism">
            {stringify(value)}
          </X.code>
        </X.pre>
      </Tab>
      <Tab label="json">
        <X.pre>
          <X.code className="language-json" codeHighlighter="prism">
            {JSON.stringify(value, null, 2)}
          </X.code>
        </X.pre>
      </Tab>
    </Tabs>
  )
}

export default JsonViewer

import { getCustomMDXComponent, Tab, Tabs } from '@rspress/core/theme'
import { useState } from 'react'
import type { JsonValue } from 'type-fest'
import { stringify } from 'yaml'

export interface JsonViewerProps {
  value: JsonValue
}

export const JsonViewer = ({ value }: JsonViewerProps) => {
  const [X] = useState(getCustomMDXComponent)
  return (
    <Tabs>
      <Tab label="yaml">
        <X.pre>
          <X.code className="language-yaml">{stringify(value)}</X.code>
        </X.pre>
      </Tab>
      <Tab label="json">
        <X.pre>
          <X.code className="language-json">
            {JSON.stringify(value, null, 2)}
          </X.code>
        </X.pre>
      </Tab>
    </Tabs>
  )
}

export default JsonViewer

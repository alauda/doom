import { Search as OriginalSearch } from '@rspress/core/theme'
import { Search as AlgoliaSearch } from '@rspress/plugin-algolia/runtime'

const Search =
  process.env.ALGOLIA_APP_ID &&
  process.env.ALGOLIA_API_KEY &&
  process.env.ALGOLIA_INDEX_NAME
    ? () => (
        <AlgoliaSearch
          docSearchProps={{
            appId: process.env.ALGOLIA_APP_ID!,
            apiKey: process.env.ALGOLIA_API_KEY!,
            indexName: process.env.ALGOLIA_INDEX_NAME!,
          }}
        />
      )
    : OriginalSearch

// eslint-disable-next-line import-x/export
export * from '@rspress/core/theme'
// eslint-disable-next-line import-x/export
export { Search }

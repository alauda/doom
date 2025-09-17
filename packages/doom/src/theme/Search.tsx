import { useLang } from '@rspress/core/runtime'
import { Search as OriginalSearch } from '@rspress/core/theme'
import {
  Search as AlgoliaSearch,
  ZH_LOCALES,
} from '@rspress/plugin-algolia/runtime'
import { useMemo } from 'react'

export const Search =
  process.env.ALGOLIA_APP_ID &&
  process.env.ALGOLIA_API_KEY &&
  process.env.ALGOLIA_INDEX_NAME
    ? () => {
        const lang = useLang()
        const docSearchProps = useMemo(
          () => ({
            appId: process.env.ALGOLIA_APP_ID!,
            apiKey: process.env.ALGOLIA_API_KEY!,
            indexName: process.env.ALGOLIA_INDEX_NAME!,
            searchParameters: {
              facetFilters: [`lang:${lang}`],
            },
          }),
          [lang],
        )
        return (
          <AlgoliaSearch docSearchProps={docSearchProps} locales={ZH_LOCALES} />
        )
      }
    : OriginalSearch

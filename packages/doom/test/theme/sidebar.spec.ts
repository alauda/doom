import type { SidebarData } from '@rspress/shared'
import { expect, test } from '@rstest/core'

import { expandActiveSidebar } from '#theme/sidebar.ts'

test('opens every ancestor of the active page and keeps other groups collapsed', () => {
  const sidebar: SidebarData = [
    {
      text: 'Upgrade',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Global',
          collapsible: true,
          collapsed: true,
          items: [{ text: 'Standard', link: '/upgrade/global/standard' }],
        },
      ],
    },
    {
      text: 'Install',
      collapsible: true,
      collapsed: true,
      items: [{ text: 'Plan', link: '/plan' }],
    },
  ]
  const result = expandActiveSidebar(
    sidebar,
    (link) => link === '/upgrade/global/standard',
  )

  expect(result[0]).toMatchObject({
    collapsed: false,
    items: [{ collapsed: false }],
  })
  expect(result[1]).toMatchObject({ collapsed: true })
  expect(sidebar[0]).toMatchObject({
    collapsed: true,
    items: [{ collapsed: true }],
  })
})

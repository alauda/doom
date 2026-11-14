import type { SidebarData } from '@rspress/shared'

// Match Rspress's initial sidebar expansion without mutating the shared payload.
export const expandActiveSidebar = (
  sidebar: SidebarData,
  activeMatcher: (link: string) => boolean,
): SidebarData => {
  const result = structuredClone(sidebar)
  const visit = (item: SidebarData[number]): boolean => {
    const activeChild = 'items' in item && item.items.map(visit).some(Boolean)
    const active =
      activeChild || ('link' in item && !!item.link && activeMatcher(item.link))
    if ('items' in item && active) {
      item.collapsed = false
    }
    return active
  }
  result.forEach(visit)
  return result
}

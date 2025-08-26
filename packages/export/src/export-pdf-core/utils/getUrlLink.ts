export const getUrlLink = (url: string) => {
  const link = new URL(url)
  return {
    link: link.origin + link.pathname,
    hash: link.hash.slice(1),
  }
}

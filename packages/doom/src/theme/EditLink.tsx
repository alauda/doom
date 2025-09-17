import { useEditLink } from './useEditLink.ts'

import classes from '@alauda/doom/styles/edit-link.module.scss'

export function EditLink() {
  const editLinkObj = useEditLink()

  if (!editLinkObj) {
    return null
  }

  const { text, link } = editLinkObj

  // EditLink must be an external site, so we use <a> directly instead of Link
  return (
    <a href={link} target="_blank" className={classes.editLink}>
      {text}
    </a>
  )
}

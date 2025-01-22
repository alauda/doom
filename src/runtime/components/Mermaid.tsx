import { useDark } from '@rspress/core/runtime'
import clsx from 'clsx'
import mermaid from 'mermaid'
import type { FC } from 'react'
import { useEffect, useId, useRef } from 'react'

export interface MermaidProps {
  className?: string
  children: string
}

export const Mermaid: FC<MermaidProps> = ({ className, children }) => {
  const id = useId()

  const isDark = useDark()

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current!

    mermaid.initialize({ theme: isDark ? 'dark' : 'default' })

    const render = async () => {
      const { svg, diagramType, bindFunctions } = await mermaid.render(
        `mermaid-${id.slice(1, -1)}`,
        children,
      )

      container.classList.add(diagramType)
      container.innerHTML = svg
      bindFunctions?.(container)
    }

    void render()
  }, [children, isDark])

  return (
    <div
      ref={containerRef}
      id={id}
      className={clsx('doom-mermaid', className)}
    />
  )
}

export default Mermaid

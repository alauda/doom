import { useEffect, useRef } from 'react'

export function useInterval(cb: () => void, delay?: number | null) {
  const cbRef = useRef<() => void>(cb)

  // Remember the latest callback.
  // eslint-disable-next-line react-hooks/refs
  cbRef.current = cb

  // Set up the interval.
  useEffect(() => {
    if (delay != null) {
      const id = setInterval(
        // ! do not try to refactor as `cbRef.current!` here! `cbRef.current` may change on each tick
        () => {
          cbRef.current()
        },
        delay,
      )
      return () => {
        clearInterval(id)
      }
    }
  }, [delay])
}

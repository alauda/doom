import { useCallback, useRef } from 'react'

export const useMemoizedFn =
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // type-coverage:ignore-next-line
  <T extends (...args: any[]) => any>(fn: T): T => {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const fnRef = useRef(fn)
    fnRef.current = fn
    return useCallback(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      (...args: Parameters<T>): ReturnType<T> => fnRef.current(...args),
      [],
    ) as T
  }

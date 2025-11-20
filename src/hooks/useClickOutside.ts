import { useEffect } from 'react'

export function useClickOutside(
  refs: any,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const refList = Array.isArray(refs) ? refs : [refs]

    const listener = (event: MouseEvent | TouchEvent) => {
      const isOutside = refList.every(ref => {
        const el = ref?.current
        return !el || !el.contains(event.target as Node)
      })

      if (isOutside) handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [refs, handler])
}

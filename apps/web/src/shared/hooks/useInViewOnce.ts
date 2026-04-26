'use client'

import { RefObject, useEffect, useRef, useState } from 'react'

interface IUseInViewOnceOptions {
  rootMargin?: string
  threshold?: number
}

interface IUseInViewOnceResult<T extends HTMLElement> {
  isInView: boolean
  ref: RefObject<T | null>
}

export const useInViewOnce = <T extends HTMLElement>({
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.18
}: IUseInViewOnceOptions = {}): IUseInViewOnceResult<T> => {
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const node = ref.current

    if (!node || isInView) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        setIsInView(true)
        observer.disconnect()
      },
      {
        rootMargin,
        threshold
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [isInView, rootMargin, threshold])

  return {
    isInView,
    ref
  }
}

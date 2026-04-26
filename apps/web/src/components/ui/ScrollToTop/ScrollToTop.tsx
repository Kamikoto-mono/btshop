'use client'

import React from 'react'
import Image from 'next/image'

import pageUpIcon from '@assets/icons/page-up.svg'
import styles from './ScrollToTop.module.scss'

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop
      const winHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const scrollPercent = scrolled / (docHeight - winHeight)

      setIsVisible(scrollPercent > 0.33)
    }

    toggleVisibility()
    window.addEventListener('scroll', toggleVisibility)

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      aria-label='Наверх'
      className={`${styles.scrollToTopButton} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      type='button'
    >
      <Image alt='Наверх' src={pageUpIcon} />
    </button>
  )
}

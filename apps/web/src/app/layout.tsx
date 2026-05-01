import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.scss'

import { AuthModal } from '@/components/auth'
import { Footer, Header, SiteBackground } from '@/components/layout'
import { MobileTabs, ScrollToTop } from '@/components/ui'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL
} from '@/shared/seo/config'
import { StoreProvider } from '@/store/StoreProvider'
import styles from './layout.module.scss'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        alt: SITE_NAME,
        url: DEFAULT_OG_IMAGE
      }
    ],
    locale: 'ru_RU',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    type: 'website'
  },
  robots: {
    follow: true,
    index: true
  },
  twitter: {
    card: 'summary_large_image',
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    title: DEFAULT_TITLE
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='ru'>
      <body className={styles.body}>
        <StoreProvider>
          <SiteBackground />
          <Header />
          <main className={styles.main}>{children}</main>
          <Footer />
          <MobileTabs />
          <ScrollToTop />
          <AuthModal />
        </StoreProvider>
      </body>
    </html>
  )
}

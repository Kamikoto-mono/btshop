import type { Metadata } from 'next'
import localFont from 'next/font/local'
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

const onest = localFont({
  display: 'swap',
  preload: true,
  src: [
    {
      path: '../../../../packages/shared/src/styles/OnestRegular.woff2',
      style: 'normal',
      weight: '400'
    },
    {
      path: '../../../../packages/shared/src/styles/OnestMedium.woff2',
      style: 'normal',
      weight: '500'
    },
    {
      path: '../../../../packages/shared/src/styles/OnestSemiBold.woff2',
      style: 'normal',
      weight: '600'
    },
    {
      path: '../../../../packages/shared/src/styles/OnestBold.woff2',
      style: 'normal',
      weight: '700'
    }
  ]
})

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
      <head>
        <link
          crossOrigin=''
          href='https://battletoads.ams3.cdn.digitaloceanspaces.com'
          rel='preconnect'
        />
      </head>
      <body className={`${styles.body} ${onest.className}`}>
        <StoreProvider>
          <SiteBackground />
          <div className={styles.chrome}>
            <Header />
            <main className={styles.main}>{children}</main>
            <Footer />
            <MobileTabs />
            <ScrollToTop />
            <AuthModal />
          </div>
        </StoreProvider>
      </body>
    </html>
  )
}

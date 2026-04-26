import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.scss'

import { AuthModal } from '@/components/auth'
import { Footer, Header, SiteBackground } from '@/components/layout'
import { MobileTabs, ScrollToTop } from '@/components/ui'
import { StoreProvider } from '@/store/StoreProvider'
import styles from './layout.module.scss'

export const metadata: Metadata = {
  title: 'Потом',
  description: 'напишу'
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

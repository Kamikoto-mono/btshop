import type { ReactNode } from 'react'

import { ConfigProvider, App as AntApp } from 'antd'

import './globals.scss'

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='ru'>
      <body>
        <ConfigProvider
          theme={{
            token: {
              borderRadius: 14,
              colorBgBase: '#f7f9fc',
              colorBorder: '#d8e1ed',
              colorPrimary: '#1d63d8',
              colorText: '#16304f',
              colorTextSecondary: '#61758f',
              fontFamily: 'Onest, sans-serif'
            },
            components: {
              Card: {
                borderRadiusLG: 24
              },
              Input: {
                activeBorderColor: '#1d63d8',
                activeShadow: '0 0 0 4px rgba(29, 99, 216, 0.08)',
                borderRadiusLG: 14,
                hoverBorderColor: '#4e86e6'
              },
              Tabs: {
                cardBg: 'transparent',
                colorBorderSecondary: 'transparent',
                inkBarColor: '#1d63d8',
                itemSelectedColor: '#16304f',
                itemColor: '#61758f',
                itemHoverColor: '#1d63d8'
              }
            }
          }}
        >
          <AntApp>{children}</AntApp>
        </ConfigProvider>
      </body>
    </html>
  )
}

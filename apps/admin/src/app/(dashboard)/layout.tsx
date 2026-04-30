import type { ReactNode } from 'react'

import { AdminShell } from '@/components/admin/AdminShell/AdminShell'

export default function DashboardLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return <AdminShell>{children}</AdminShell>
}

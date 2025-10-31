import type { Metadata } from 'next'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Accounting Portal',
  description: 'Personal accounting platform for invoices and estimates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}


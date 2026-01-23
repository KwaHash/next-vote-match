import MainHeader from '@/components/main-header'
import TailwindIndicator from '@/components/tailwind-indicator'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import '@/index.css'
import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'わたしの政治',
  description: '政治は、わたしの"推し"から始まる',
  authors: [{ name: 'わたしの政治' }],
  openGraph: {
    title: 'わたしの政治',
    description: '政治は、わたしの"推し"から始まる',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <body>
        <Providers>
          <Toaster />
          <Sonner />
          <MainHeader />
          {children}
        </Providers>
        <TailwindIndicator />
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ImmoConnect - Marketplace Immobilier',
  description: 'Plateforme de marketplace immobilière bidirectionnelle. Trouvez votre bien idéal ou vendez facilement.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' }
    ],
    apple: '/logo.png',
  },
  appleWebApp: {
    title: 'ImmoConnect',
    statusBarStyle: 'default',
    capable: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
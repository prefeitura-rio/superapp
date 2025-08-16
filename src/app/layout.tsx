export const dynamic = 'force-dynamic'

import { PWAProvider } from '@/providers/pwa-provider'
import { ThemeColorMeta } from '@/providers/theme-color-meta'
import { ThemeProvider } from '@/providers/theme-provider'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Pref Rio',
  description: 'Acesso a serviços públicos e informações.',
  appleWebApp: {
    title: 'Pref Rio',
    capable: true,
    statusBarStyle: 'black-translucent',
    startupImage: {
      url: '/icons/apple-icon.png',
    },
  },
  icons: {
    icon: '/icons/apple-icon.png',
    apple: '/icons/apple-icon.png',
  },
  other: {
    'format-detection': 'telephone=no, email=no, address=no',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Note: Nonce is generated in middleware but not enforced in current CSP policy
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="manifest" href="/manifest.json" />

        <meta name="theme-color" content="#ffffff" />
        {/* Google Analytics Data Stream */}
        <GoogleAnalytics
          debugMode={process.env.NODE_ENV === 'development'}
          nonce={nonce}
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''}
        />

        {/* Google Tag Manager */}
        <GoogleTagManager
          nonce={nonce}
          gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || ''}
        />
      </head>
      <body
        className={`${dmSans.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PWAProvider>{children}</PWAProvider>
          <ThemeColorMeta />
          <Toaster
            position="bottom-center"
            toastOptions={{
              className:
                'rounded-full! bg-secondary! text-foreground! py-3! px-5! text-sm! font-normal! shadow-none!',
              success: {
                iconTheme: {
                  primary: 'var(--success) !important',
                  secondary: 'var(--background) !important',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--foreground) !important',
                  secondary: 'var(--background) !important',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'

import { PWAProvider } from '@/providers/pwa-provider'
import { ThemeColorMeta } from '@/providers/theme-color-meta'
import { ThemeProvider } from '@/providers/theme-provider'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Portal do Cidadão',
  description: 'Acesso a serviços públicos e informações.',
  // manifest: '/manifest.json',
  appleWebApp: {
    title: 'Portal do Cidadão',
    capable: true,
    statusBarStyle: 'black-translucent',
    startupImage: {
      url: '/icons/apple-icon.png',
    },
  },
  themeColor: '#ffffff',
  icons: {
    icon: '/icons/apple-icon.png',
    apple: '/icons/apple-icon.png',
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
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <meta name="theme-color" content="#ffffff" />
        {/* Google Analytics Data Stream */}
        <Script
          strategy="afterInteractive" // Ensures script runs after the page is interactive
          nonce={nonce}
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
        />
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `,
          }}
        />

        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID}');
            `,
          }}
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

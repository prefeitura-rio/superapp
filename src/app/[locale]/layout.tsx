export const dynamic = 'force-dynamic'

import { PWAProvider } from '@/providers/pwa-provider'
import { ThemeColorMeta } from '@/providers/theme-color-meta'
import { ThemeProvider } from '@/providers/theme-provider'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  // Note: Nonce is generated in middleware but not enforced in current CSP policy
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/web-app-manifest-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
        {/* Google Analytics Data Stream */}
        <Script
          strategy="afterInteractive"
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
      <body className={`${dmSans.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
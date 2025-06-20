import { ThemeProvider } from '@/providers/theme-provider'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Super App',
  description: 'Acesso a serviços públicos e informações.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/web-app-manifest-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${dmSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
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

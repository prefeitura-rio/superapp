'use client'
import Script from 'next/script'

interface HandTalkPluginConfig {
  token: string
  /** "left" | "right" — padrão: direita */
  side?: 'left' | 'right'
  /** "top" | "center" | "bottom" — padrão: centro */
  align?: 'top' | 'default' | 'bottom'
  addonsMap?: {
    colorControl?: {
      contrastMode?: boolean
      saturationMode?: boolean
      pageColors?: boolean
    }
  }
}

declare global {
  interface Window {
    HT: new (config: HandTalkPluginConfig) => unknown
  }
}

export function HandTalkPlugin({
  token,
  nonce,
}: {
  token: string
  nonce?: string
}) {
  return (
    <Script
      src="https://plugin.handtalk.me/web/latest/handtalk.min.js"
      strategy="afterInteractive"
      nonce={nonce}
      onLoad={() => {
        new window.HT({
          token,
          side: 'right',
          align: 'default',
          addonsMap: {
            colorControl: {
              contrastMode: false,
            },
          },
        })
      }}
    />
  )
}

'use client'

import Script from 'next/script'

const CDN_URL =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/a11y-plugin/a11y-plugin.min.js'

export function AccessibilityPlugin() {
  return (
    <Script
      src={CDN_URL}
      strategy="afterInteractive"
      onLoad={() => {
        const w = window as unknown as { A11yPlugin?: { init: () => void } }
        w.A11yPlugin?.init()
      }}
    />
  )
}

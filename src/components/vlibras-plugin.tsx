'use client'

import { watchVLibrasLandmark } from '@/lib/vlibras-landmark'
import Script from 'next/script'
import { useEffect } from 'react'

interface VLibrasPluginProps {
  nonce?: string
}

export function VLibrasPlugin({ nonce }: VLibrasPluginProps) {
  useEffect(() => watchVLibrasLandmark(), [])

  return (
    <Script
      src="https://vlibras.gov.br/app/vlibras-plugin.js"
      strategy="afterInteractive"
      nonce={nonce}
    />
  )
}

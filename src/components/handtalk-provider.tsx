'use client'

import Script from 'next/script'

interface HandTalkProviderProps {
  nonce?: string
}

export function HandTalkProvider({ nonce }: HandTalkProviderProps) {
  return (
    <Script
      src="https://plugin.handtalk.me/web/latest/handtalk.min.js"
      strategy="afterInteractive"
      nonce={nonce}
      onLoad={() => {
        // Inicializa o HandTalk após o carregamento do script principal
        if (typeof window !== 'undefined' && window.HT) {
          new window.HT({
            token: process.env.NEXT_PUBLIC_TESTE_HAND_TALK!,
          })
        }
      }}
    />
  )
}

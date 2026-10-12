import Script from 'next/script'

interface VLibrasPluginProps {
  nonce?: string
}

export function VLibrasPlugin({ nonce }: VLibrasPluginProps) {
  return (
    <Script
      src="https://vlibras.gov.br/app/vlibras-plugin.js"
      strategy="afterInteractive"
      nonce={nonce}
    />
  )
}

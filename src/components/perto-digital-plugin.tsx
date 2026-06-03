import Script from 'next/script'

export function PertoDigitalPlugin({ nonce }: { nonce?: string }) {
  const script = `
!function e(){"complete"===document.readyState?window.setTimeout((function(){var e,n,t;e="https://cdn.pertoplugin.link/plugin/perto.js.gz",n=700,t="https://pertocdn.pertoplugin.link/plugin/perto.js.gz",new Promise((function(o,i){var c=document.createElement("script");function r(){if(document.head.removeChild(c),t){var e=document.createElement("script");e.src=t,document.head.appendChild(e),e.onload=function(){o(!0)},e.onerror=function(){o(!1)}}else o(!1)}c.src=e,document.head.appendChild(c);var u=setTimeout((function(){r()}),n);c.onload=function(){clearTimeout(u),o(!0)},c.onerror=function(){clearTimeout(u),r()}}))}),500):window.setTimeout((function(){e()}),700)}();
`.trim()

  return (
    <Script
      id="perto-digital-plugin"
      strategy="afterInteractive"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}

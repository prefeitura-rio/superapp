import Script from 'next/script'

export function EqualWebPlugin({
  sitekey,
  nonce,
}: {
  sitekey: string
  nonce?: string
}) {
  const script = `
window.interdeal = {
  get sitekey() { return ${JSON.stringify(sitekey)} },
  get domains() {
    return {
      "js": "https://cdn.equalweb.com/",
      "acc": "https://access.equalweb.com/"
    }
  },
  "Position": "left",
  "Menulang": "PT",
  "draggable": true,
  "btnStyle": {
    "vPosition": ["80%", "80%"],
    "margin": ["0", "0"],
    "scale": ["0.5", "0.5"],
    "color": { "main": "#13335a", "second": "#ffffff" },
    "icon": { "outline": false, "outlineColor": "#ffffff", "type": 1, "shape": "circle" }
  }
};
(function(doc, head, body) {
  var coreCall = doc.createElement('script');
  coreCall.src = interdeal.domains.js + 'core/5.2.5/accessibility.js';
  coreCall.defer = true;
  coreCall.integrity = 'sha512-Zamp30ps601kXvZTcIYv1sytUc090mrEJD9rLuoWzEGqmB6t0XdLRgC/g5TznUleEBIMm6T3c6Baf/ExIYh/Hw==';
  coreCall.crossOrigin = 'anonymous';
  coreCall.setAttribute('data-cfasync', true);
  body ? body.appendChild(coreCall) : head.appendChild(coreCall);
})(document, document.head, document.body);
`.trim()

  return (
    <Script
      id="equalweb-plugin"
      strategy="afterInteractive"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}

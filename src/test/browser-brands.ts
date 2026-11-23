/**
 * Marcas de `navigator.userAgentData.brands` (User-Agent Client Hints) por
 * navegador, para os testes que dependem de `isGoogleChrome`. O jsdom não
 * implementa `userAgentData`, assim como Safari, Firefox e o Chrome no iOS.
 */
export const BROWSER_BRANDS = {
  chrome: ['Not)A;Brand', 'Google Chrome', 'Chromium'],
  edge: ['Not)A;Brand', 'Microsoft Edge', 'Chromium'],
  opera: ['Not)A;Brand', 'Opera', 'Chromium'],
  samsungInternet: ['Not)A;Brand', 'Samsung Internet', 'Chromium'],
  brave: ['Not)A;Brand', 'Brave', 'Chromium'],
  androidWebView: ['Not)A;Brand', 'Android WebView', 'Chromium'],
  chromium: ['Not)A;Brand', 'Chromium'],
} as const

export type BrowserWithBrands = keyof typeof BROWSER_BRANDS

/** Simula um navegador com `navigator.userAgentData`. */
export function stubBrowser(browser: BrowserWithBrands): void {
  Object.defineProperty(window.navigator, 'userAgentData', {
    configurable: true,
    value: {
      brands: BROWSER_BRANDS[browser].map(brand => ({ brand, version: '127' })),
      mobile: false,
      platform: 'Windows',
    },
  })
}

/** Volta ao jsdom puro, sem `userAgentData` (como Safari e Firefox). */
export function restoreBrowser(): void {
  Reflect.deleteProperty(window.navigator, 'userAgentData')
}

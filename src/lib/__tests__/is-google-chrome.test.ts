import {
  type BrowserWithBrands,
  restoreBrowser,
  stubBrowser,
} from '@/test/browser-brands'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isGoogleChrome } from '../is-google-chrome'

describe('isGoogleChrome', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    restoreBrowser()
  })

  it('reconhece o Google Chrome pela marca do User-Agent Client Hints', () => {
    stubBrowser('chrome')
    expect(isGoogleChrome()).toBe(true)
  })

  it.each<BrowserWithBrands>([
    'edge',
    'opera',
    'samsungInternet',
    'brave',
    'androidWebView',
    'chromium',
  ])('%s, mesmo baseado no Chromium, não é o Google Chrome', browser => {
    stubBrowser(browser)
    expect(isGoogleChrome()).toBe(false)
  })

  it('sem userAgentData (Safari, Firefox, Chrome no iOS) não é o Google Chrome', () => {
    expect(isGoogleChrome()).toBe(false)
  })

  it('com userAgentData sem marcas não é o Google Chrome', () => {
    Object.defineProperty(window.navigator, 'userAgentData', {
      configurable: true,
      value: {},
    })
    expect(isGoogleChrome()).toBe(false)
  })

  it('fora do navegador não é o Google Chrome', () => {
    vi.stubGlobal('navigator', undefined)
    expect(isGoogleChrome()).toBe(false)
  })
})

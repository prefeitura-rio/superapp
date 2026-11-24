import {
  isAccessibilityPluginEnabled,
  isHomeBannersV3Enabled,
  isSalesforceServicesEnabled,
  isServiceRatingEnabled,
  isSgrcHistoricoEnabled,
  isVLibrasEnabled,
} from '@/lib/feature-flags'
import { afterEach, describe, expect, test, vi } from 'vitest'

describe('isAccessibilityPluginEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('is enabled when the flag is "true" (staging build)', () => {
    vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', 'true')

    expect(isAccessibilityPluginEnabled()).toBe(true)
  })

  test('is disabled when the flag is "false" (production build)', () => {
    vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', 'false')

    expect(isAccessibilityPluginEnabled()).toBe(false)
  })

  test('is disabled when the flag is absent', () => {
    vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', undefined)

    expect(isAccessibilityPluginEnabled()).toBe(false)
  })

  test('is disabled for any value other than "true"', () => {
    for (const value of ['', '1', 'TRUE', 'yes', ' true']) {
      vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', value)

      expect(isAccessibilityPluginEnabled()).toBe(false)
    }
  })
})

describe('isVLibrasEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('isSalesforceServicesEnabled', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    test('is enabled only when the unified flag is exactly "true"', () => {
      vi.stubEnv('FEATURE_SALESFORCE', 'true')

      expect(isSalesforceServicesEnabled()).toBe(true)
    })

    test('is disabled when the flag is absent or not exactly "true"', () => {
      for (const value of [undefined, 'false', '', 'TRUE', '1']) {
        vi.stubEnv('FEATURE_SALESFORCE', value)

        expect(isSalesforceServicesEnabled()).toBe(false)
      }
    })
  })

  test('is enabled when the flag is "true" (staging build)', () => {
    vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', 'true')

    expect(isVLibrasEnabled()).toBe(true)
  })

  test('is disabled when the flag is "false" (production build)', () => {
    vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', 'false')

    expect(isVLibrasEnabled()).toBe(false)
  })

  test('is disabled when the flag is absent', () => {
    vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', undefined)

    expect(isVLibrasEnabled()).toBe(false)
  })

  test('is disabled for any value other than "true"', () => {
    for (const value of ['', '1', 'TRUE', 'yes', ' true']) {
      vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', value)

      expect(isVLibrasEnabled()).toBe(false)
    }
  })
})

describe('isSgrcHistoricoEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('is enabled only when the flag is exactly "true"', () => {
    vi.stubEnv('FEATURE_SGRC_HISTORICO', 'true')

    expect(isSgrcHistoricoEnabled()).toBe(true)
  })

  test('is disabled when the flag is absent or not exactly "true" (production default)', () => {
    for (const value of [undefined, 'false', '', 'TRUE', '1', ' true']) {
      vi.stubEnv('FEATURE_SGRC_HISTORICO', value)

      expect(isSgrcHistoricoEnabled()).toBe(false)
    }
  })

  test('does not depend on FEATURE_SALESFORCE (callers check both)', () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')
    vi.stubEnv('FEATURE_SGRC_HISTORICO', 'true')

    expect(isSgrcHistoricoEnabled()).toBe(true)
  })
})

describe('isHomeBannersV3Enabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('is enabled only when the flag is exactly "true"', () => {
    vi.stubEnv('FEATURE_HOME_BANNERS_V3', 'true')

    expect(isHomeBannersV3Enabled()).toBe(true)
  })

  test('is disabled when the flag is absent or not exactly "true" (production default)', () => {
    for (const value of [undefined, 'false', '', 'TRUE', '1', ' true']) {
      vi.stubEnv('FEATURE_HOME_BANNERS_V3', value)

      expect(isHomeBannersV3Enabled()).toBe(false)
    }
  })
})

describe('isServiceRatingEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('is enabled only with FEATURE_AVALIACAO_SERVICO and FEATURE_SALESFORCE both "true"', () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('FEATURE_AVALIACAO_SERVICO', 'true')

    expect(isServiceRatingEnabled()).toBe(true)
  })

  test('is disabled when FEATURE_AVALIACAO_SERVICO is absent or not exactly "true"', () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    for (const value of [undefined, 'false', '', 'TRUE', '1', ' true']) {
      vi.stubEnv('FEATURE_AVALIACAO_SERVICO', value)

      expect(isServiceRatingEnabled()).toBe(false)
    }
  })

  test('is disabled without FEATURE_SALESFORCE (the vote needs the Carta articleId)', () => {
    vi.stubEnv('FEATURE_AVALIACAO_SERVICO', 'true')
    for (const value of [undefined, 'false', '']) {
      vi.stubEnv('FEATURE_SALESFORCE', value)

      expect(isServiceRatingEnabled()).toBe(false)
    }
  })
})

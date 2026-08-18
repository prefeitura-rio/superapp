import { describe, expect, test } from 'vitest'

import { DIVIDA_ATIVA_EXTERNAL_LINKS } from '../divida-ativa-links'

/**
 * Guarda contra o estado em que estes links nasceram: strings vazias.
 *
 * `ExternalLinkDrawer` ignora URL vazia silenciosamente, então uma constante em branco não
 * quebra build, teste nem render — ela só produz um botão "Confirmar" que não faz nada, e
 * isso chega ao cidadão. Estes testes existem para que essa falha seja barulhenta.
 */
describe('DIVIDA_ATIVA_EXTERNAL_LINKS', () => {
  const entradas = Object.entries(DIVIDA_ATIVA_EXTERNAL_LINKS)

  test('cobre os três serviços que continuam no portal legado', () => {
    expect(entradas).toHaveLength(3)
  })

  test.each(entradas)('%s é uma URL https absoluta e não vazia', (_, url) => {
    expect(url).not.toBe('')
    expect(() => new URL(url)).not.toThrow()
    expect(new URL(url).protocol).toBe('https:')
  })

  test.each(entradas)(
    '%s aponta para o portal oficial da Prefeitura',
    (_, url) => {
      expect(new URL(url).hostname).toBe('daminternet.rio.rj.gov.br')
    }
  )
})

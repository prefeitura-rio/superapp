// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const renderToBuffer = vi.fn()
vi.mock('@react-pdf/renderer', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  renderToBuffer: (...args: unknown[]) => renderToBuffer(...args),
}))

import { clearCartaPdfCache, getCachedCartaPdf } from '../render-carta-pdf'

const org = {
  siciCode: '1200',
  name: 'Controladoria',
  shortName: 'CGM',
  publishedServices: 1,
}
const services = [{ slug: 'a', lastModifiedDate: '2026-10-14T00:00:00Z' }]

describe('getCachedCartaPdf', () => {
  beforeEach(() => {
    clearCartaPdfCache()
    renderToBuffer.mockReset()
    renderToBuffer.mockResolvedValue(Buffer.from('%PDF-'))
  })

  it('reaproveita o PDF e pedidos simultâneos dividem a geração', async () => {
    await Promise.all([
      getCachedCartaPdf(org, services),
      getCachedCartaPdf(org, services),
    ])
    await getCachedCartaPdf(org, services)
    expect(renderToBuffer).toHaveBeenCalledTimes(1)
  })

  it('gera de novo quando o conteúdo muda', async () => {
    await getCachedCartaPdf(org, services)
    await getCachedCartaPdf(org, [
      { slug: 'a', lastModifiedDate: '2026-10-15T00:00:00Z' },
    ])
    expect(renderToBuffer).toHaveBeenCalledTimes(2)
  })

  it('gera de novo depois de 10 minutos', async () => {
    const now = Date.now()
    await getCachedCartaPdf(org, services, now)
    await getCachedCartaPdf(org, services, now + 10 * 60 * 1000 + 1)
    expect(renderToBuffer).toHaveBeenCalledTimes(2)
  })

  it('falha não fica em cache', async () => {
    renderToBuffer.mockRejectedValueOnce(new Error('boom'))
    await expect(getCachedCartaPdf(org, services)).rejects.toThrow('boom')
    await expect(getCachedCartaPdf(org, services)).resolves.toBeInstanceOf(
      Buffer
    )
    expect(renderToBuffer).toHaveBeenCalledTimes(2)
  })
})

describe('stripControlChars', () => {
  it('remove caracteres de controle em objetos aninhados e mantém \n e \t', async () => {
    const { stripControlChars } = await import('../render-carta-pdf')
    expect(
      stripControlChars({
        name: 'Táxi\u000b',
        list: ['a\u0015b'],
        n: 1,
        text: 'x\ny\tz',
      })
    ).toEqual({ name: 'Táxi', list: ['ab'], n: 1, text: 'x\ny\tz' })
  })
})

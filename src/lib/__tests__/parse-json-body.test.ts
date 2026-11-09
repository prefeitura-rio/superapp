// @vitest-environment node
import { describe, expect, test } from 'vitest'
import { parseJsonBody } from '../parse-json-body'

describe('parseJsonBody', () => {
  test('texto vazio vira null em vez de lançar', () => {
    expect(parseJsonBody('')).toBeNull()
    expect(parseJsonBody('  \n')).toBeNull()
  })

  test('texto que não é JSON vira null em vez de lançar', () => {
    expect(parseJsonBody('<html>Bad Gateway</html>')).toBeNull()
  })

  test('texto JSON é convertido', () => {
    expect(parseJsonBody('{"protocolos":[]}')).toEqual({ protocolos: [] })
  })

  test('objeto já convertido passa adiante sem mudança', () => {
    const data = { protocolos: [{ protocolo: 'RIO-2026-00000001' }] }
    expect(parseJsonBody(data)).toBe(data)
  })

  test('null e undefined viram null', () => {
    expect(parseJsonBody(null)).toBeNull()
    expect(parseJsonBody(undefined)).toBeNull()
  })
})

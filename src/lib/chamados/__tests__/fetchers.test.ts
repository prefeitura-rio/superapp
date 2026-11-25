import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ChamadosHttpError,
  chamadosRetry,
  fetchChamadoDetalhe,
  fetchChamadoPublico,
} from '../fetchers'
import { chamadosKeys } from '../query-keys'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

const ok = (json: unknown, status = 200) => ({
  ok: true,
  status,
  json: async () => json,
})
const fail = (status: number) => ({ ok: false, status })

describe('chamadosKeys', () => {
  it('keys específicas começam pelo prefixo da lista, para invalidar em grupo', () => {
    expect(chamadosKeys.salesforce().slice(0, 2)).toEqual(chamadosKeys.lists())
    expect(chamadosKeys.sgrc(2).slice(0, 2)).toEqual(chamadosKeys.lists())
    expect(chamadosKeys.detail('RIO-1').slice(0, 2)).toEqual(
      chamadosKeys.details()
    )
  })

  it('cada página SGRC tem a sua key', () => {
    expect(chamadosKeys.sgrc(1)).not.toEqual(chamadosKeys.sgrc(2))
  })

  it('titular e público do mesmo protocolo não compartilham cache', () => {
    expect(chamadosKeys.detail('RIO-1')).not.toEqual(
      chamadosKeys.publico('RIO-1')
    )
  })
})

describe('chamadosRetry', () => {
  it('não repete 4xx', () => {
    expect(chamadosRetry(0, new ChamadosHttpError(401))).toBe(false)
    expect(chamadosRetry(0, new ChamadosHttpError(404))).toBe(false)
  })
  it('repete 5xx e erro de rede uma vez', () => {
    expect(chamadosRetry(0, new ChamadosHttpError(502))).toBe(true)
    expect(chamadosRetry(1, new ChamadosHttpError(502))).toBe(false)
    expect(chamadosRetry(0, new TypeError('network'))).toBe(true)
  })
})

describe('fetchChamadoPublico', () => {
  it.each([404, 204])('%s vira null (resultado esperado)', async status => {
    fetchMock.mockResolvedValue({ ok: status < 300, status })
    await expect(fetchChamadoPublico('RIO-1')).resolves.toBeNull()
  })

  it('5xx lança ChamadosHttpError', async () => {
    fetchMock.mockResolvedValue(fail(502))
    await expect(fetchChamadoPublico('RIO-1')).rejects.toMatchObject({
      status: 502,
    })
  })
})

describe('fetchChamadoDetalhe', () => {
  it('usa a visão do titular quando o BFF devolve o protocolo', async () => {
    fetchMock.mockResolvedValueOnce(ok({ protocolo: 'RIO-1' }))
    await expect(fetchChamadoDetalhe('RIO-1')).resolves.toEqual({
      visao: 'titular',
      data: { protocolo: 'RIO-1' },
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('cai na consulta pública quando o titular recebe 401', async () => {
    fetchMock
      .mockResolvedValueOnce(fail(401))
      .mockResolvedValueOnce(ok({ protocolo: 'RIO-1' }))
    await expect(fetchChamadoDetalhe('RIO-1')).resolves.toMatchObject({
      visao: 'publico',
    })
    expect(fetchMock.mock.calls[1][0]).toBe('/api/chamados-publico/RIO-1')
  })

  it('cai na consulta pública em erro de rede', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(ok({ protocolo: 'RIO-1' }))
    await expect(fetchChamadoDetalhe('RIO-1')).resolves.toMatchObject({
      visao: 'publico',
    })
  })

  it('não vira fallback quando a requisição foi cancelada', async () => {
    const controller = new AbortController()
    controller.abort()
    fetchMock.mockRejectedValue(new DOMException('abort', 'AbortError'))
    await expect(
      fetchChamadoDetalhe('RIO-1', controller.signal)
    ).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('protocolo inexistente nos dois lados lança 404', async () => {
    fetchMock.mockResolvedValue(fail(404))
    await expect(fetchChamadoDetalhe('RIO-1')).rejects.toMatchObject({
      status: 404,
    })
  })
})

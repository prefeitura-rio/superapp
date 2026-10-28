import { describe, expect, it } from 'vitest'
import {
  getVagaPath,
  getVagaPathSegment,
  isVagaUuid,
  isValidVagaSlug,
} from '../vaga-slug'

const UUID = '45a1378e-9452-44ac-abbe-337e42eae217'
const SLUG = 'agente-de-campo-45a1378e9452'

describe('isVagaUuid', () => {
  it('reconhece o UUID da URL antiga', () => {
    expect(isVagaUuid(UUID)).toBe(true)
    expect(isVagaUuid(UUID.toUpperCase())).toBe(true)
  })

  it('não confunde slug nem texto com UUID', () => {
    expect(isVagaUuid(SLUG)).toBe(false)
    expect(isVagaUuid(`${UUID}-extra`)).toBe(false)
    expect(isVagaUuid('')).toBe(false)
  })
})

describe('isValidVagaSlug', () => {
  it('aceita o formato da API (<titulo>-<hex>)', () => {
    expect(isValidVagaSlug(SLUG)).toBe(true)
    expect(isValidVagaSlug('analista-financeiro-jr-b06235c80d2a')).toBe(true)
  })

  it('recusa entrada fora do formato', () => {
    expect(isValidVagaSlug('')).toBe(false)
    expect(isValidVagaSlug('..')).toBe(false)
    expect(isValidVagaSlug('Agente-De-Campo')).toBe(false)
    expect(isValidVagaSlug('agente--campo')).toBe(false)
    expect(isValidVagaSlug('-agente')).toBe(false)
    expect(isValidVagaSlug('agente-')).toBe(false)
    expect(isValidVagaSlug('agente de campo')).toBe(false)
    expect(isValidVagaSlug('agente/campo')).toBe(false)
    expect(isValidVagaSlug('agente%2fcampo')).toBe(false)
    expect(isValidVagaSlug('a'.repeat(301))).toBe(false)
  })
})

describe('getVagaPath', () => {
  it('usa o slug quando a vaga tem slug', () => {
    expect(getVagaPath({ id: UUID, slug: SLUG })).toBe(
      `/servicos/trabalho/${SLUG}`
    )
    expect(getVagaPathSegment({ id: UUID, slug: ` ${SLUG} ` })).toBe(SLUG)
  })

  it('cai para o id quando não há slug válido', () => {
    expect(getVagaPath({ id: UUID })).toBe(`/servicos/trabalho/${UUID}`)
    expect(getVagaPath({ id: UUID, slug: '' })).toBe(
      `/servicos/trabalho/${UUID}`
    )
    expect(getVagaPath({ id: UUID, slug: null })).toBe(
      `/servicos/trabalho/${UUID}`
    )
    expect(getVagaPath({ id: UUID, slug: 'Título Inválido' })).toBe(
      `/servicos/trabalho/${UUID}`
    )
  })
})

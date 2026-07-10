import {
  getCertificateTemplate,
  getTemplateUrl,
  usesNewCertificateLayout,
} from '@/lib/certificate-template-mapping'
import { describe, expect, it } from 'vitest'

describe('getCertificateTemplate', () => {
  it('mapeia órgãos para templates v2', () => {
    expect(getCertificateTemplate('5300')).toBe('juvrio')
    expect(getCertificateTemplate('2641')).toBe('planetario')
    expect(getCertificateTemplate('4000')).toBe('smpd')
    expect(getCertificateTemplate('52451')).toBe('cvlsubtd')
    expect(getCertificateTemplate('1900')).toBe('sesrio')
    expect(getCertificateTemplate('4700')).toBe('spmrio')
  })

  it('mantém smac no mapeamento legado', () => {
    expect(getCertificateTemplate('2400')).toBe('smac')
  })

  it('é case-insensitive no orgao_id', () => {
    expect(getCertificateTemplate('5300')).toBe('juvrio')
  })

  it('retorna null para orgao_id desconhecido ou vazio', () => {
    expect(getCertificateTemplate('99999')).toBeNull()
    expect(getCertificateTemplate('')).toBeNull()
  })
})

describe('getTemplateUrl', () => {
  it('retorna URL da API para template mapeado', () => {
    expect(getTemplateUrl('4700')).toBe('/api/templates/spmrio')
    expect(getTemplateUrl('2641')).toBe('/api/templates/planetario')
  })

  it('retorna null quando não há mapeamento', () => {
    expect(getTemplateUrl('99999')).toBeNull()
  })
})

describe('usesNewCertificateLayout', () => {
  it('marca templates novos como layout v2', () => {
    expect(usesNewCertificateLayout('juvrio')).toBe(true)
    expect(usesNewCertificateLayout('planetario')).toBe(true)
    expect(usesNewCertificateLayout('smpd')).toBe(true)
    expect(usesNewCertificateLayout('cvlsubtd')).toBe(true)
    expect(usesNewCertificateLayout('sesrio')).toBe(true)
    expect(usesNewCertificateLayout('spmrio')).toBe(true)
  })

  it('mantém smac no layout legado', () => {
    expect(usesNewCertificateLayout('smac')).toBe(false)
  })
})

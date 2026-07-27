import { ChannelType } from '@/http-pref-rio-carta-servicos/models/channelType'
import type { ServiceDetail } from '@/http-pref-rio-carta-servicos/models/serviceDetail'
import { mapServiceDetailToPrefRioService } from '@/lib/carta-servicos/mappers'
import { describe, expect, it } from 'vitest'

describe('mapServiceDetailToPrefRioService', () => {
  it('maps nested ServiceDetail to flat ModelsPrefRioService', () => {
    const detail: ServiceDetail = {
      slug: 'iptu-2025',
      name: 'IPTU 2025',
      serviceCatalogId: 'cat-123',
      articleStatus: 'Online',
      themeName: 'Tributos',
      subthemeName: 'Impostos',
      responsibleOrgUnit: 'Secretaria Municipal de Fazenda',
      responsibleOrgUnitShortName: 'SMF',
      lastModifiedDate: '2025-06-15T12:00:00.000Z',
      info: {
        summary: 'Resumo do IPTU',
        fullDescription: 'Descrição completa',
        cost: 'Gratuito',
        serviceDeadline: '30 dias',
        isFree: true,
        targetAudience: ['Contribuintes'],
      },
      howToRequest: {
        instructions: 'Como solicitar',
        serviceResult: 'Resultado esperado',
        requiredDocs: ['RG', 'CPF'],
        exclusions: 'Não cobre X',
      },
      channels: [
        {
          type: ChannelType.Presencial,
          endereco: 'Rua A, 100',
        },
        {
          type: ChannelType.Digital,
          channelType: 'Site',
          value: 'https://pref.rio/iptu',
        },
      ],
      buttons: [
        {
          title: 'Acessar serviço',
          description: 'Portal IPTU',
          url: 'https://pref.rio/iptu',
          order: 1,
        },
      ],
      legislation: [{ titulo: 'Lei 123/2020', order: 1 }],
    }

    const result = mapServiceDetailToPrefRioService(detail)

    expect(result.nome_servico).toBe('IPTU 2025')
    expect(result.resumo).toBe('Resumo do IPTU')
    expect(result.descricao_completa).toBe('Descrição completa')
    expect(result.custo_servico).toBe('Gratuito')
    expect(result.tempo_atendimento).toBe('30 dias')
    expect(result.tema_geral).toBe('Tributos')
    expect(result.sub_categoria).toBe('Impostos')
    expect(result.status).toBe(1)
    expect(result.is_free).toBe(true)
    expect(result.orgao_gestor).toEqual([
      'Secretaria Municipal de Fazenda (SMF)',
    ])
    expect(result.canais_presenciais).toEqual(['Rua A, 100'])
    expect(result.canais_digitais).toEqual(['Site: https://pref.rio/iptu'])
    expect(result.documentos_necessarios).toEqual(['RG', 'CPF'])
    expect(result.legislacao_relacionada).toEqual(['Lei 123/2020'])
    expect(result.buttons?.[0]?.titulo).toBe('Acessar serviço')
    expect(result.buttons?.[0]?.is_enabled).toBe(true)
    expect(result.last_update).toBe(
      Math.floor(Date.parse('2025-06-15T12:00:00.000Z') / 1000)
    )
  })

  it('treats null articleStatus as published (MuleSoft runtime)', () => {
    const detail: ServiceDetail = {
      slug: 'controle-de-roedores-1',
      name: 'Controle de roedores',
      serviceCatalogId: 'a03be00000bfHcIAAU',
      themeName: 'Cidade',
      info: {},
      howToRequest: {},
    }

    expect(mapServiceDetailToPrefRioService(detail).status).toBe(1)
  })

  it('maps Draft articleStatus to unpublished', () => {
    const detail: ServiceDetail = {
      slug: 'draft-service',
      name: 'Draft',
      articleStatus: 'Draft',
      info: {},
      howToRequest: {},
    }

    expect(mapServiceDetailToPrefRioService(detail).status).toBe(0)
  })
})

import { getFilteredCategoryServices } from '@/lib/carta-servicos/themes-filter-response'
import { describe, expect, it } from 'vitest'

const cidadeFilteredResponse = {
  filtered_category: {
    services: [
      {
        summary: null,
        name: 'Cadastro para recebimento de Alertas da Defesa Civil',
        slug: 'cadastro-para-recebimento-de-alertas-da-defesa-civil',
      },
    ],
    total_services: 14,
    per_page: 4,
    page: 1,
    name: 'Cidade',
    slug: 'cidade',
  },
  meta: { total_pages: 1, total: 10, per_page: 10, page: 1 },
  data: [{ name: 'Cidade', slug: 'cidade', publishedServices: 14 }],
}

describe('getFilteredCategoryServices', () => {
  it('reads services from filtered_category (MuleSoft runtime shape)', () => {
    const result = getFilteredCategoryServices(cidadeFilteredResponse)

    expect(result?.name).toBe('Cidade')
    expect(result?.services).toHaveLength(1)
    expect(result?.services?.[0]?.slug).toBe(
      'cadastro-para-recebimento-de-alertas-da-defesa-civil'
    )
  })

  it('parses JSON string payloads', () => {
    const result = getFilteredCategoryServices(
      JSON.stringify(cidadeFilteredResponse)
    )

    expect(result?.total_services).toBe(14)
  })

  it('returns null when filtered_category.services is missing', () => {
    expect(getFilteredCategoryServices({ data: [] })).toBeNull()
  })
})

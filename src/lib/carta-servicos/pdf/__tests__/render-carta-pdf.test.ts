// @vitest-environment node
import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { htmlToPdf, htmlToPlainText } from '../html-to-pdf'
import { renderCartaPdf } from '../render-carta-pdf'

const service = (i: number): ClientsCartaServiceDetail => ({
  name: `Serviço número ${i}`,
  slug: `servico-${i}`,
  themeSlug: 'servidor',
  articleStatus: 'Online',
  responsibleOrgUnitSiciCode: '1200',
  lastPublishedDate: '2026-10-14T15:46:16.000Z',
  lastModifiedDate: '2026-10-14T15:46:16.000Z',
  info: {
    summary: '<p>Atesta a inexistência de <strong>pendências</strong>.</p>',
    fullDescription:
      '<h3>O que é:</h3><p>Documento oficial.</p><h3>Quem pode solicitar:</h3><p>Servidores.</p>',
    cost: 'Gratuito',
    serviceDeadline: '2 Dias corridos',
  },
  howToRequest: {
    instructions:
      '<h3>Para solicitações on-line:</h3><ol><li>Clique em “Acessar serviço”;</li><li>Faça login com <a href="https://id.rio">ID Carioca</a>.</li></ol>',
    serviceResult: '<p>Declaração eletrônica.</p>',
    requiredDocs: ['<ul><li>CPF;</li><li>Documento de identidade.</li></ul>'],
    exclusions: '<p>Não cobre pendências de outros órgãos.</p>',
  },
  buttons: [
    { title: 'Acessar serviço', url: 'https://jeap.rio.gov.br', enabled: true },
  ],
  channels: [
    {
      type: 'Presencial',
      titulo: 'Coordenadoria',
      endereco: 'Rua Afonso Cavalcanti, 455 - Cidade Nova',
      enabled: true,
    },
  ],
  legislation: [{ order: 1, titulo: 'Decreto nº 41.827/2016' }],
})

describe('renderCartaPdf', () => {
  it('gera um PDF A4 com capa, índice, apresentação e catálogo', async () => {
    const services = Array.from({ length: 40 }, (_, i) => service(i + 1))
    const pdf = await renderCartaPdf(
      {
        siciCode: '1200',
        name: 'Controladoria Geral do Município do Rio de Janeiro',
        shortName: 'CGM',
        publishedServices: services.length,
      },
      services
    )

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')

    const doc = await PDFDocument.load(pdf)
    // capa + índice + apresentação + catálogo; >10 páginas cobre o bug do WOFF
    // no número de página dinâmico (ver styles.ts)
    expect(doc.getPageCount()).toBeGreaterThan(10)
    const { width, height } = doc.getPage(0).getSize()
    expect(Math.round(width)).toBe(595)
    expect(Math.round(height)).toBe(842)
    expect(doc.getTitle()).toContain('CGM')
  }, 30_000)
})

describe('htmlToPdf', () => {
  it('ignora vazio e descarta script', () => {
    expect(htmlToPdf('')).toEqual([])
    expect(htmlToPdf('   ')).toEqual([])
    expect(htmlToPdf('<script>alert(1)</script>')).toEqual([])
  })

  it('gera um bloco por parágrafo/lista', () => {
    expect(htmlToPdf('<p>a</p><ul><li>b</li></ul><p>c</p>')).toHaveLength(3)
  })

  it('texto solto vira parágrafo', () => {
    expect(htmlToPdf('Texto sem tag')).toHaveLength(1)
  })
})

describe('htmlToPlainText', () => {
  it('remove marcação e decodifica entidades', () => {
    expect(htmlToPlainText('<p>2&nbsp;Dias <strong>úteis</strong></p>')).toBe(
      '2 Dias úteis'
    )
  })
})

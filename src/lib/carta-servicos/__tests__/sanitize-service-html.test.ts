import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import { mapServiceDetailToPrefRioService } from '@/lib/carta-servicos/mappers'
import {
  sanitizePrefRioServiceHtml,
  sanitizeServiceHtml,
} from '@/lib/carta-servicos/sanitize-service-html'
import { describe, expect, it } from 'vitest'
import { avaliacaoDeRiscoHtml } from './fixtures/avaliacao-de-risco'

function serviceWith(
  overrides: Partial<ModelsPrefRioService>
): ModelsPrefRioService {
  return {
    autor: '',
    custo_servico: 'Gratuito',
    descricao_completa: '',
    nome_servico: 'Serviço',
    orgao_gestor: [],
    resultado_solicitacao: '',
    resumo: '',
    tema_geral: 'Cidade',
    tempo_atendimento: '',
    ...overrides,
  }
}

describe('sanitizeServiceHtml', () => {
  it('keeps the rich text from the tree-risk service and forces link attrs', () => {
    const clean = sanitizeServiceHtml(avaliacaoDeRiscoHtml.instructions)

    expect(clean).toContain('<h3>')
    expect(clean).toContain('<strong>')
    expect(clean).toContain('<ul>')
    expect(clean).toContain('<li>')
    expect(clean).toContain('https://api.whatsapp.com/send?phone=552134601746')
    expect(clean).toContain('target="_blank"')
    expect(clean).toContain('rel="noopener noreferrer"')
    expect(clean).toContain('Acessar serviço')
  })

  it('keeps headings and paragraphs in the full description', () => {
    const clean = sanitizeServiceHtml(avaliacaoDeRiscoHtml.fullDescription)

    expect(clean).toContain('<h3>')
    expect(clean).toContain('<strong>O que é:</strong>')
    expect(clean).toContain('<p>')
    expect(clean).not.toContain('<script')
  })

  it('keeps summary, result and exclusions paragraphs', () => {
    expect(sanitizeServiceHtml(avaliacaoDeRiscoHtml.summary)).toContain('<p>')
    expect(sanitizeServiceHtml(avaliacaoDeRiscoHtml.serviceResult)).toContain(
      'Retirada de árvore'
    )
    expect(sanitizeServiceHtml(avaliacaoDeRiscoHtml.exclusions)).toContain(
      'áreas particulares'
    )
  })

  it('keeps safe formatting tags and mailto or tel links', () => {
    const clean = sanitizeServiceHtml(
      '<h2>Título</h2><h4>Sub</h4><p><em>i</em> <u>u</u></p><ol><li>1</li></ol><br><a href="mailto:a@pref.rio">e</a><a href="tel:1746">t</a>'
    )

    expect(clean).toContain('<h2>')
    expect(clean).toContain('<h4>')
    expect(clean).toContain('<em>')
    expect(clean).toContain('<u>')
    expect(clean).toContain('<ol>')
    expect(clean).toContain('<br>')
    expect(clean).toContain('href="mailto:a@pref.rio"')
    expect(clean).toContain('href="tel:1746"')
  })

  it('drops script, event handlers, javascript and data urls, and unknown tags', () => {
    const clean = sanitizeServiceHtml(
      '<p onclick="alert(1)" style="color:red" aria-label="x">ok</p><script>alert(1)</script><img src="x" onerror="alert(1)"><iframe src="https://evil.test"></iframe><svg><script>alert(1)</script></svg><a href="javascript:alert(1)">js</a><a href="JaVaScRiPt:alert(1)">js2</a><a href="data:text/html,hi">data</a><a href="https://pref.rio" onclick="alert(1)">ok</a>'
    )

    expect(clean).toContain('<p>ok</p>')
    expect(clean).not.toContain('<script')
    expect(clean).not.toContain('onerror')
    expect(clean).not.toContain('onclick')
    expect(clean).not.toContain('style=')
    expect(clean).not.toContain('aria-')
    expect(clean).not.toContain('<img')
    expect(clean).not.toContain('<iframe')
    expect(clean).not.toContain('<svg')
    expect(clean).not.toContain('javascript:')
    expect(clean).not.toContain('JaVaScRiPt:')
    expect(clean).not.toContain('data:')
    expect(clean).toContain('href="https://pref.rio"')
    expect(clean).toContain('rel="noopener noreferrer"')
  })

  it('is idempotent', () => {
    const once = sanitizeServiceHtml(avaliacaoDeRiscoHtml.instructions)
    expect(sanitizeServiceHtml(once)).toBe(once)
  })

  it('returns an empty string for blank input', () => {
    expect(sanitizeServiceHtml('   ')).toBe('')
  })

  it('leaves plain-text document names intact', () => {
    expect(sanitizeServiceHtml('RG')).toBe('RG')
  })
})

describe('sanitizePrefRioServiceHtml', () => {
  it('cleans html fields and leaves legislation markdown as published', () => {
    const service = serviceWith({
      resumo: `${avaliacaoDeRiscoHtml.summary}<script>alert(1)</script>`,
      descricao_completa: avaliacaoDeRiscoHtml.fullDescription,
      instrucoes_solicitante: avaliacaoDeRiscoHtml.instructions,
      resultado_solicitacao: avaliacaoDeRiscoHtml.serviceResult,
      servico_nao_cobre: avaliacaoDeRiscoHtml.exclusions,
      documentos_necessarios: ['<p>RG</p><img src=x onerror=alert(1)>', 'CPF'],
      legislacao_relacionada: [avaliacaoDeRiscoHtml.legislationTitulo],
      nome_servico: 'Avaliação de risco de queda da árvore',
    })

    const clean = sanitizePrefRioServiceHtml(service)

    expect(clean.resumo).not.toContain('<script')
    expect(clean.resumo).toContain('<p>')
    expect(clean.descricao_completa).toContain('<h3>')
    expect(clean.instrucoes_solicitante).toContain('noopener noreferrer')
    expect(clean.documentos_necessarios?.[0]).toContain('<p>RG</p>')
    expect(clean.documentos_necessarios?.[0]).not.toContain('<img')
    expect(clean.documentos_necessarios?.[1]).toBe('CPF')
    expect(clean.legislacao_relacionada).toEqual([
      avaliacaoDeRiscoHtml.legislationTitulo,
    ])
    expect(clean.nome_servico).toBe('Avaliação de risco de queda da árvore')
  })
})

describe('mapServiceDetailToPrefRioService html passthrough', () => {
  it('copies the published html through unchanged', () => {
    const detail: ClientsCartaServiceDetail = {
      slug: 'avaliacao-de-risco-de-queda-da-arvore',
      name: 'Avaliação de risco de queda da árvore',
      info: {
        summary: avaliacaoDeRiscoHtml.summary,
        fullDescription: avaliacaoDeRiscoHtml.fullDescription,
      },
      howToRequest: {
        instructions: avaliacaoDeRiscoHtml.instructions,
        serviceResult: avaliacaoDeRiscoHtml.serviceResult,
        exclusions: avaliacaoDeRiscoHtml.exclusions,
        requiredDocs: [],
      },
      legislation: [
        { titulo: avaliacaoDeRiscoHtml.legislationTitulo, order: 1 },
      ],
    }

    const result = mapServiceDetailToPrefRioService(detail)

    expect(result.resumo).toBe(avaliacaoDeRiscoHtml.summary)
    expect(result.descricao_completa).toBe(avaliacaoDeRiscoHtml.fullDescription)
    expect(result.instrucoes_solicitante).toBe(
      avaliacaoDeRiscoHtml.instructions
    )
    expect(result.resultado_solicitacao).toBe(
      avaliacaoDeRiscoHtml.serviceResult
    )
    expect(result.servico_nao_cobre).toBe(avaliacaoDeRiscoHtml.exclusions)
    expect(result.legislacao_relacionada).toEqual([
      avaliacaoDeRiscoHtml.legislationTitulo,
    ])
  })
})

/**
 * Mapping between organization IDs (cd_ua/orgao_id) and their corresponding certificate templates
 * Each organization should have its own PDF template in src/lib/templates/
 */
export type CertificateTemplate =
  | 'juvrio'
  | 'planetario'
  | 'smac'
  | 'smpd'
  | 'cvlsubtd'
  | 'sesrio'
  | 'spmrio'

export interface OrganizationTemplateMapping {
  orgao_id: string // cd_ua do departamento
  template: CertificateTemplate
}

/**
 * Templates com layout v2 (banner lateral + texto alinhado à esquerda).
 * smac permanece no layout legado até migração futura.
 */
const NEW_LAYOUT_TEMPLATES: ReadonlySet<CertificateTemplate> = new Set([
  'juvrio',
  'planetario',
  'smpd',
  'cvlsubtd',
  'sesrio',
  'spmrio',
])

/**
 * Mapeamento dos IDs de organizações (orgao_id/cd_ua) para templates de certificado
 *
 * Templates disponíveis:
 * - juvrio.pdf: Secretaria Especial da Juventude Carioca - JUV-RIO (layout v2)
 * - planetario.pdf: Fundação Planetário da Cidade do Rio de Janeiro - PLANETÁRIO (layout v2)
 * - smac.pdf: Secretaria Municipal de Meio Ambiente e Clima - SMAC (legado)
 * - smpd.pdf: Secretaria Municipal da Pessoa com Deficiência - SMPD (layout v2)
 * - cvlsubtd.pdf: CVL / Subsecretaria (layout v2)
 * - sesrio.pdf: SES-RIO (layout v2)
 * - spmrio.pdf: Secretaria Especial de Políticas para Mulheres - SPM-RIO (layout v2)
 *
 * NOTA: Os orgao_id devem ser os valores de cd_ua retornados pela API de departamentos.
 * Para adicionar um novo mapeamento, consulte a API para obter o cd_ua correto.
 */
const TEMPLATE_MAPPINGS: OrganizationTemplateMapping[] = [
  {
    orgao_id: '5300',
    template: 'juvrio',
  },
  {
    orgao_id: '2641',
    template: 'planetario',
  },
  {
    orgao_id: '2400',
    template: 'smac',
  },
  {
    orgao_id: '4000',
    template: 'smpd',
  },
  {
    orgao_id: '52451',
    template: 'cvlsubtd',
  },
  {
    orgao_id: '1900',
    template: 'sesrio',
  },
  {
    orgao_id: '4700',
    template: 'spmrio',
  },
]

/**
 * Indica se o template usa o layout v2 (banner + texto à esquerda).
 */
export function usesNewCertificateLayout(
  template: CertificateTemplate
): boolean {
  return NEW_LAYOUT_TEMPLATES.has(template)
}

/**
 * Obtém o template de certificado baseado no ID do órgão (orgao_id/cd_ua)
 *
 * @param orgao_id ID do órgão (cd_ua) fornecedor do curso
 * @returns Nome do arquivo de template ou null se não encontrado
 */
export function getCertificateTemplate(
  orgao_id: string
): CertificateTemplate | null {
  if (!orgao_id) {
    return null
  }

  // Procura o mapeamento pelo orgao_id
  const mapping = TEMPLATE_MAPPINGS.find(
    m => m.orgao_id.toLowerCase() === orgao_id.toLowerCase()
  )

  if (mapping) {
    return mapping.template
  }

  // Retorna null se não encontrar mapeamento
  console.warn(`Template não encontrado para orgao_id: ${orgao_id}.`)
  return null
}

/**
 * Constrói a URL do template baseado no ID do órgão (orgao_id/cd_ua)
 *
 * @param orgao_id ID do órgão (cd_ua) fornecedor do curso
 * @returns URL da rota API para o template ou null se não encontrado
 */
export function getTemplateUrl(orgao_id: string): string | null {
  const template = getCertificateTemplate(orgao_id)
  if (!template) {
    return null
  }
  return `/api/templates/${template}`
}

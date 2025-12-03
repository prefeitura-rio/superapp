/**
 * Mapping between organization/provider names and their corresponding certificate templates
 * Each organization should have its own PDF template in src/lib/templates/
 */
export type CertificateTemplate = 'juvrio' | 'planetario' | 'smac' | 'smpd'

export interface OrganizationTemplateMapping {
  organization: string
  template: CertificateTemplate
}

/**
 * Mapeamento das organizações para templates de certificado
 *
 * Templates disponíveis:
 * - juvrio.pdf: Secretaria Especial da Juventude Carioca - JUV-RIO
 * - planetario.pdf: Fundacao Planetario da Cidade do Rio de Janeiro - PLANETARIO do Rio
 * - smac.pdf: Secretaria Municipal de Assistência Social e Direitos Humanos
 * - smpd.pdf: Secretaria Municipal da Pessoa com Deficiência - SMPD
 */
const TEMPLATE_MAPPINGS: OrganizationTemplateMapping[] = [
  {
    organization: 'Secretaria Especial da Juventude Carioca (JUV-RIO)',
    template: 'juvrio',
  },
  {
    organization:
      'Fundação Planetário da Cidade do Rio de Janeiro (PLANETÁRIO)',
    template: 'planetario',
  },
  {
    organization: 'Secretaria Municipal de Meio Ambiente e Clima (SMAC)',
    template: 'smac',
  },
  {
    organization: 'Secretaria Municipal da Pessoa com Deficiência (SMPD)',
    template: 'smpd',
  },
]

/**
 * Obtém o template de certificado baseado no nome da organização
 *
 * @param organization Nome da organização fornecedora do curso
 * @returns Nome do arquivo de template ou null se não encontrado
 */
export function getCertificateTemplate(
  organization: string
): CertificateTemplate | null {
  const normalizedOrg = organization?.trim() || ''

  // Procura o mapeamento exato primeiro
  const mapping = TEMPLATE_MAPPINGS.find(
    m => m.organization.toLowerCase() === normalizedOrg.toLowerCase()
  )

  if (mapping) {
    return mapping.template
  }

  // Retorna null se não encontrar mapeamento
  console.warn(`Template não encontrado para organização: ${organization}.`)
  return null
}

/**
 * Constrói a URL do template baseado no nome da organização
 *
 * @param organization Nome da organização fornecedora do curso
 * @returns URL da rota API para o template ou null se não encontrado
 */
export function getTemplateUrl(organization: string): string | null {
  const template = getCertificateTemplate(organization)
  if (!template) {
    return null
  }
  return `/api/templates/${template}`
}

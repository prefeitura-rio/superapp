// Transform category name for display purposes
// This is a pure utility function with no server-side dependencies
export function getCategoryDisplayName(name: string): string {
  // Lei de Acesso à Informação (LAI) → Acesso à Informação
  if (
    name.includes('Lei de Acesso à Informação') ||
    name.includes('Lei de Acesso a Informação')
  ) {
    return 'Acesso à Informação'
  }

  // Lei Geral de Proteção de Dados (LGPD) → LGPD
  if (
    name.includes('Lei Geral de Proteção de Dados') ||
    name.includes('Lei Geral de Protecao de Dados')
  ) {
    return 'LGPD'
  }

  // Central Anticorrupção → Anticorrupção
  if (
    name.includes('Central Anticorrupção') ||
    name.includes('Central Anticorrupcao')
  ) {
    return 'Anticorrupção'
  }

  // Return original name if no transformation needed
  return name
}

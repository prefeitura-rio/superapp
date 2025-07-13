/**
 * Content transformation rules for service descriptions
 */

/**
 * Applies content transformation rules to a given text
 * @param text - The original text to transform
 * @returns The transformed text
 */
export function applyContentRules(text: string): string {
  if (!text) return text

  // Rule 1: Replace "campo "ACESSAR O SERVIÇO" ao lado" with "botão "Acessar serviço""
  let transformedText = text.replace(
    /campo "ACESSAR O SERVIÇO" ao lado/g,
    'botão "Acessar serviço"'
  )

  // Rule 2: Replace ""ACESSAR O SERVIÇO" ao lado." with "Acessar serviço"
  transformedText = transformedText.replace(
    /"ACESSAR O SERVIÇO" ao lado\./g,
    'Acessar serviço.'
  )

  return transformedText
}

/**
 * Applies content rules specifically to etapa descriptions
 * @param descricao - The etapa description to transform
 * @returns The transformed description
 */
export function applyEtapaRules(descricao: string): string {
  return applyContentRules(descricao)
}

/**
 * Transforms category names from underscore format to readable format
 * @param categoria - The category string to transform (e.g., "cultura_esporte")
 * @returns The transformed category (e.g., "Cultura/Esporte")
 */
export function applyCategoriaRules(categoria: string): string {
  if (!categoria) return categoria

  // Replace underscores with forward slashes and capitalize each word
  return categoria
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('/')
}

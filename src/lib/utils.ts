import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shouldShowUpdateBadge(updatedAt?: string): boolean {
  if (!updatedAt) {
    return true // Show badge if updated_at is empty
  }

  const updatedDate = new Date(updatedAt)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  return updatedDate <= sixMonthsAgo // Show badge if updated 6+ months ago
}

/**
 * Formata o nome do usuário retornando apenas os dois primeiros nomes
 * com a primeira letra de cada nome maiúscula
 * @param userName - Nome completo do usuário
 * @returns Nome formatado com dois nomes (ex: "Lucas Tavares")
 */
export function formatUserName(userName: string): string {
  if (!userName || typeof userName !== 'string') {
    return ''
  }

  // Remove espaços extras e divide por espaços
  const names = userName.trim().split(/\s+/)

  // Pega apenas o primeiro nome
  const firstName = names[0]

  // Formata o nome: primeira letra maiúscula, resto minúscula
  if (!firstName) return ''

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
}

/**
 * Retorna o nome de exibição do usuário, priorizando nome_exibicao se disponível,
 * caso contrário retorna o nome padrão
 * @param displayName - Nome de exibição personalizado (nome_exibicao)
 * @param defaultName - Nome padrão do usuário (name)
 * @returns Nome de exibição formatado
 */
export function getDisplayName(
  displayName?: string,
  defaultName?: string
): string {
  // Se nome_exibicao existe e não está vazio, usa ele
  if (displayName?.trim()) {
    return displayName
  }

  // Caso contrário, usa o nome padrão formatado (apenas primeiro nome)
  if (defaultName?.trim()) {
    return formatUserName(defaultName)
  }

  return ''
}

/**
 * Formata qualquer texto com a primeira letra de cada palavra em maiúscula
 * @param text - Texto a ser formatado (ex: "joao silva", "JOAO SILVA")
 * @param mode - 'all' (padrão) capitaliza cada palavra, 'first' capitaliza apenas a primeira letra
 * @returns Texto formatado
 * - mode='all': "Joao Silva"
 * - mode='first': "Joao silva"
 */
export function formatTitleCase(
  text: string,
  mode: 'all' | 'first' = 'all'
): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const trimmed = text.trim()

  if (mode === 'first') {
    // Capitalize only the first letter, rest to lowercase
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  // mode === 'all': Capitalize first letter of each word
  const words = trimmed.split(/\s+/)

  const formattedWords = words.map(word => {
    if (!word) return ''
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return formattedWords.join(' ')
}

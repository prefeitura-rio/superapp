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

  // Pega apenas os dois primeiros nomes
  const firstTwoNames = names.slice(0, 2)

  // Formata cada nome: primeira letra maiúscula, resto minúscula
  const formattedNames = firstTwoNames.map(name => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  })

  // Retorna os nomes formatados separados por espaço
  return formattedNames.join(' ')
}

/**
 * Formata qualquer texto com a primeira letra de cada palavra em maiúscula
 * @param text - Texto a ser formatado (ex: "joao silva", "JOAO SILVA")
 * @returns Texto formatado com primeira letra de cada palavra em maiúscula (ex: "Joao Silva")
 */
export function formatTitleCase(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Remove espaços extras e divide por espaços
  const words = text.trim().split(/\s+/)

  // Formata cada palavra: primeira letra maiúscula, resto minúscula
  const formattedWords = words.map(word => {
    if (!word) return ''
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  // Retorna as palavras formatadas separadas por espaço
  return formattedWords.join(' ')
}

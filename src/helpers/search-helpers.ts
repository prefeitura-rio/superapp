import type { ExternalSearchLink } from '@/constants/external-search-links'
import { EXTERNAL_SEARCH_LINKS } from '@/constants/external-search-links'
import { ENABLE_HARDCODED_SEARCH_LINKS } from '@/constants/venvs'

export interface SearchResultItem {
  titulo: string
  tipo: 'servico' | 'curso' | 'job' | 'link_externo' | string
  url?: string
  descricao?: string
  category?: string
  collection?: string
  id?: string
  slug?: string
}

export interface ApiResponse {
  result: SearchResultItem[]
}

export const SEARCH_HISTORY_KEY = 'search-history'
export const MAX_HISTORY_ITEMS = 10

/**
 * Normalizes a string by removing accents and special characters
 * Example: "Jaé" -> "jae", "transporte" -> "transporte"
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .trim()
}

/**
 * Common stop words in Portuguese that should be ignored in search
 */
const STOP_WORDS = new Set([
  'a',
  'ao',
  'aos',
  'as',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'para',
  'por',
  'que',
  'com',
  'como',
  'faço',
  'fazer',
  'faz',
  'foi',
  'ser',
  'são',
  'se',
  'um',
  'uma',
  'umas',
  'uns',
])

/**
 * Extracts meaningful words from a query, removing stop words
 */
function extractSearchTerms(query: string): string[] {
  const normalized = normalizeSearchText(query)
  const words = normalized.split(/\s+/).filter(word => word.length > 0)
  return words.filter(word => !STOP_WORDS.has(word) && word.length > 2)
}

/**
 * Checks if search terms match against a text field
 * Returns true if at least one meaningful term is found
 */
function matchesSearchTerms(searchTerms: string[], text: string): boolean {
  if (!text || searchTerms.length === 0) return false

  const normalizedText = normalizeSearchText(text)

  // Check if any search term appears in the text
  return searchTerms.some(term => normalizedText.includes(term))
}

/**
 * Calculates a relevance score for a search match
 * Higher score means better match
 */
function calculateRelevanceScore(
  searchTerms: string[],
  item: ExternalSearchLink
): number {
  let score = 0
  const normalizedTitle = normalizeSearchText(item.titulo)
  const normalizedDescription = item.descricao
    ? normalizeSearchText(item.descricao)
    : ''
  const normalizedKeywords =
    item.palavras_chave?.map(kw => normalizeSearchText(kw)) || []

  searchTerms.forEach(term => {
    // Title match gives highest score
    if (normalizedTitle.includes(term)) {
      score += 10
    }

    // Keyword match gives high score
    if (normalizedKeywords.some(kw => kw.includes(term))) {
      score += 8
    }

    // Description match gives medium score
    if (normalizedDescription.includes(term)) {
      score += 5
    }
  })

  return score
}

/**
 * Filters hardcoded external link results based on search query
 * Uses intelligent word matching to find relevant results even with partial queries
 */
export function filterHardcodedResults(
  query: string,
  hardcodedItems: ExternalSearchLink[]
): ExternalSearchLink[] {
  if (!query || query.trim().length <= 2) {
    return []
  }

  const normalizedQuery = normalizeSearchText(query)
  const searchTerms = extractSearchTerms(query)

  // If no meaningful terms after filtering stop words, use the full normalized query
  const termsToSearch = searchTerms.length > 0 ? searchTerms : [normalizedQuery]

  return hardcodedItems
    .map(item => {
      // Check if item matches any search term
      const normalizedTitle = normalizeSearchText(item.titulo)
      const normalizedDescription = item.descricao
        ? normalizeSearchText(item.descricao)
        : ''
      const normalizedKeywords =
        item.palavras_chave?.map(kw => normalizeSearchText(kw)) || []

      // First check: exact match (original behavior for backward compatibility)
      const exactMatch =
        normalizedTitle.includes(normalizedQuery) ||
        normalizedDescription.includes(normalizedQuery) ||
        normalizedKeywords.some(kw => kw.includes(normalizedQuery))

      // Second check: word-by-word match
      const wordMatch =
        matchesSearchTerms(termsToSearch, item.titulo) ||
        matchesSearchTerms(termsToSearch, item.descricao) ||
        item.palavras_chave?.some(keyword =>
          matchesSearchTerms(termsToSearch, keyword)
        ) ||
        false

      if (exactMatch || wordMatch) {
        // Calculate relevance score for sorting
        const score = calculateRelevanceScore(termsToSearch, item)
        return { item, score }
      }

      return null
    })
    .filter(
      (result): result is { item: ExternalSearchLink; score: number } =>
        result !== null
    )
    .sort((a, b) => b.score - a.score) // Sort by relevance (highest first)
    .map(result => result.item)
}

/**
 * Merges hardcoded results with API results, giving priority to hardcoded items
 */
export function mergeSearchResults(
  hardcodedResults: ExternalSearchLink[],
  apiResults: SearchResultItem[]
): SearchResultItem[] {
  // Convert hardcoded results to SearchResultItem format
  const convertedHardcoded: SearchResultItem[] = hardcodedResults.map(item => ({
    titulo: item.titulo,
    tipo: item.tipo,
    url: item.url,
    descricao: item.descricao,
    id: item.id,
  }))

  // Filter out any API results that might duplicate hardcoded results (by URL)
  const hardcodedUrls = new Set(
    convertedHardcoded.map(item => item.url).filter(Boolean)
  )
  const filteredApiResults = apiResults.filter(
    item => !item.url || !hardcodedUrls.has(item.url)
  )

  // Return hardcoded results first, then API results
  return [...convertedHardcoded, ...filteredApiResults]
}

/**
 * Loads search history from localStorage
 */
export function loadSearchHistory(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
  if (!savedHistory) {
    return []
  }

  try {
    return JSON.parse(savedHistory)
  } catch (error) {
    console.error('Error parsing search history:', error)
    localStorage.removeItem(SEARCH_HISTORY_KEY)
    return []
  }
}

/**
 * Saves a search query to history in localStorage
 */
export function saveSearchToHistory(searchQuery: string): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  if (!searchQuery.trim() || searchQuery.length <= 2) {
    return loadSearchHistory()
  }

  const trimmedQuery = searchQuery.trim()
  const currentHistory = loadSearchHistory()

  // Remove the query if it already exists (to avoid duplicates)
  const filteredHistory = currentHistory.filter(item => item !== trimmedQuery)
  // Add the new query at the beginning
  const newHistory = [trimmedQuery, ...filteredHistory].slice(
    0,
    MAX_HISTORY_ITEMS
  )

  // Save to localStorage
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))

  return newHistory
}

/**
 * Removes an item from search history
 */
export function removeFromHistory(itemToRemove: string): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  const currentHistory = loadSearchHistory()
  const newHistory = currentHistory.filter(item => item !== itemToRemove)
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  return newHistory
}

/**
 * Performs a search by fetching API results and merging with hardcoded results
 * Hardcoded results are only included if the feature flag is enabled
 */
export async function performSearch(
  searchQuery: string
): Promise<SearchResultItem[]> {
  // Filter hardcoded results based on query (only if feature flag is enabled)
  const hardcodedResults = ENABLE_HARDCODED_SEARCH_LINKS
    ? filterHardcodedResults(searchQuery, EXTERNAL_SEARCH_LINKS)
    : []

  // Fetch API results
  let apiResults: SearchResultItem[] = []
  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(searchQuery)}`
    )
    if (response.ok) {
      const data: ApiResponse = await response.json()
      apiResults = data.result || []
    }
  } catch (apiError) {
    console.error('Error fetching search results from API:', apiError)
    // Continue with hardcoded results even if API fails (if enabled)
  }

  // Merge results with hardcoded items having higher priority (if enabled)
  return ENABLE_HARDCODED_SEARCH_LINKS
    ? mergeSearchResults(hardcodedResults, apiResults)
    : apiResults
}

/**
 * Normalizes category name to slug format
 */
export function normalizeCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .trim()
}

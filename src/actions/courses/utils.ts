export const FAVORITES_KEY = 'courses-favorites'

/*
 * ================================================
 * HELPERS GERAIS
 * ================================================
 */

// Retira UUID do slug do curso
export const extractCourseId = (slug: string): string => {
  return slug.substring(0, 36)
}

/*
 * ================================================
 * LOCAL STORAGE - GESTÃO DE DADOS LOCAIS
 * ================================================
 */

// Helper para gerenciar localStorage favoritos
export const getFavoritesFromStorage = (): string[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    localStorage.removeItem(FAVORITES_KEY)
    return []
  }
}

export function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: <regex>
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  )
}

export function createCourseSlug(id: string | number, title: string): string {
  return `${id}-${slugify(title)}`
}

/*
 * ================================================
 * FILTROS DE CURSOS - CONFIGURAÇÃO & DADOS
 * ================================================
 */

// Filtros de cursos - usados no drawer, badges, query params
export const COURSE_FILTERS = {
  modalidade: [
    { label: 'Presencial', value: 'Presencial' },
    { label: 'Remoto', value: 'Remoto' },
  ],
  local_curso: [
    { label: 'Zona Oeste', value: 'zona-oeste' },
    { label: 'Zona Norte', value: 'zona-norte' },
    { label: 'Zona Sul', value: 'zona-sul' },
    { label: 'Centro', value: 'centro' },
  ],
  categoria: [
    { label: 'Todos', value: 'todos' },
    { label: 'Saúde', value: 'saude' },
    { label: 'Nutrição', value: 'nutricao' },
    { label: 'Vigilância', value: 'vigilancia' },
    { label: 'Estética', value: 'estetica' },
    { label: 'Tecnologia', value: 'tecnologia' },
    { label: 'Legislação', value: 'legislacao' },
    { label: 'Alimentos', value: 'alimentos' },
    { label: 'Imunização', value: 'imunizacao' },
    { label: 'Radiologia', value: 'radiologia' },
  ],
  acessibilidade: [
    { label: 'Acessível PCD', value: 'acessivel' },
    { label: 'Exclusivo PCD', value: 'exclusivo' },
  ],
} as const

/*
 * ================================================
 * FILTROS - GERAÇÃO DE LABELS & VALIDAÇÃO
 * ================================================
 */

// Função para gerar labels dos badges dos filtros automaticamente
export const generateFilterLabels = () => {
  const labels: Record<string, Record<string, string>> = {}

  for (const [filterKey, options] of Object.entries(COURSE_FILTERS)) {
    labels[filterKey] = {}
    for (const option of options) {
      labels[filterKey][option.value] = option.label
    }
  }

  return labels
}

// Labels geradas automaticamente
export const FILTER_LABELS = generateFilterLabels()

// Helper para buscar label de um filtro
export const getFilterLabel = (filterType: string, value: string): string => {
  return FILTER_LABELS[filterType]?.[value] || value
}

// Helper para validar se um filtro é válido
export const isValidFilter = (filterType: string, value: string): boolean => {
  return (
    COURSE_FILTERS[filterType as keyof typeof COURSE_FILTERS]?.some(
      option => option.value === value
    ) ?? false
  )
}

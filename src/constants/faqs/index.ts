import { cursosFaqSections } from './cursos'
import { faqSections } from './pref-rio'
import { trabalhoFaqSections } from './trabalho'

export type FaqSource = 'prefrio' | 'cursos' | 'trabalho'

export interface UnifiedFaqItem {
  id: string
  originalId: string
  source: FaqSource
  sourceLabel: string
  title: string
  content: string
}

export const FAQ_SOURCE_LABELS: Record<FaqSource, string> = {
  prefrio: 'PrefRio',
  cursos: 'Cursos',
  trabalho: 'Trabalho',
}

const prefRioItems: UnifiedFaqItem[] = faqSections.flatMap(section =>
  section.items.map(item => ({
    id: `prefrio-${section.id}-${item.title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
    originalId: section.id,
    source: 'prefrio' as FaqSource,
    sourceLabel: FAQ_SOURCE_LABELS.prefrio,
    title: item.title,
    content: Array.isArray(item.content)
      ? item.content.join('\n')
      : item.content,
  }))
)

const cursosItems: UnifiedFaqItem[] = cursosFaqSections.map(section => ({
  id: `cursos-${section.id}`,
  originalId: section.id,
  source: 'cursos' as FaqSource,
  sourceLabel: FAQ_SOURCE_LABELS.cursos,
  title: section.title,
  content: section.content,
}))

const trabalhoItems: UnifiedFaqItem[] = trabalhoFaqSections.map(section => ({
  id: `trabalho-${section.id}`,
  originalId: section.id,
  source: 'trabalho' as FaqSource,
  sourceLabel: FAQ_SOURCE_LABELS.trabalho,
  title: section.title,
  content: section.content,
}))

export const ALL_FAQ_ITEMS: UnifiedFaqItem[] = [
  ...prefRioItems,
  ...cursosItems,
  ...trabalhoItems,
]

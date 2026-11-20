import { MoreVerticalIcon } from '../assets/icons'

export const aditionalCategoriesFull = [
  {
    name: 'Mais',
    icon: <MoreVerticalIcon width={32} height={32} />,
    categorySlug: 'mais',
    relevanciaMedia: 0,
    quantidadeServicos: 0,
  },
]

export const categoriesRoute: Record<string, string> = {
  mais: '/servicos',
} as const

export const categoriesUrl = (slug: string) =>
  categoriesRoute[slug] || `/servicos/categoria/${slug}`

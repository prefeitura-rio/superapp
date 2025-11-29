import type { Category } from '@/lib/categories'
import Image from 'next/image'
import { createElement } from 'react'
import { MoreVerticalIcon } from '../assets/icons'

const ouvidoriaIcon =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/categorias%20de%20servi%C3%A7o/Ouvidoria.png'
const cursosIcon =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/categorias%20de%20servi%C3%A7o/Cursos.png'

const moreCategories = [
  {
    name: 'Mais',
    icon: <MoreVerticalIcon width={40} height={40} />,
    categorySlug: 'mais',
    relevanciaMedia: 0,
    quantidadeServicos: 0,
  },
]

export const additionalCategories: Category[] = [
  // {
  //   name: 'Ouvidoria',
  //   icon: createElement(Image, {
  //     src: ouvidoriaIcon,
  //     alt: 'ouvidoria',
  //     width: 48,
  //     height: 48,
  //     className: 'w-12 h-12',
  //   }),
  //   categorySlug: 'ouvidoria',
  //   relevanciaMedia: 0,
  //   quantidadeServicos: 0,
  // },
  {
    name: 'Cursos',
    icon: createElement(Image, {
      src: cursosIcon,
      alt: 'cursos',
      width: 48,
      height: 48,
      className: 'w-12 h-12',
    }),
    categorySlug: 'cursos',
    relevanciaMedia: 0,
    quantidadeServicos: 0,
  },
]

export const aditionalCategoriesFull = [
  ...additionalCategories,
  ...moreCategories,
]

export const categoriesRoute: Record<string, string> = {
  // ouvidoria: '/ouvidoria',
  cursos: '/servicos/cursos',
  mais: '/servicos',
} as const

export const categoriesUrl = (slug: string) =>
  categoriesRoute[slug] || `/servicos/categoria/${slug}`

import {
  additionalCategories,
  aditionalCategoriesFull,
} from '@/constants/aditional-services'
import { type Category, getIconForCategory } from '@/lib/categories'
import { getCategoryDisplayName } from '@/lib/category-display-name'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryGrid } from '../category-grid'
import HomeCategoriesGrid from '../home-categories-grid'

/**
 * DEV-359 — o ícone de categoria (getIconForCategory) repetia no alt o nome
 * que o card já mostra em texto, e o leitor de tela anunciava a categoria duas
 * vezes (axe image-redundant-alt na grade "Serviços" da home).
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock('swiper/modules', () => ({ Pagination: {} }))
vi.mock('swiper/css', () => ({}))
vi.mock('swiper/css/pagination', () => ({}))

const NAMES = [
  'Cidade',
  'Tributos',
  'Transporte',
  'Lei de Acesso à Informação (LAI)',
]

function category(name: string): Category {
  return {
    name,
    icon: getIconForCategory(name),
    categorySlug: name.toLowerCase().replace(/\W+/g, '-'),
    relevanciaMedia: 1,
    quantidadeServicos: 1,
  }
}

const categories = NAMES.map(category)

describe('getIconForCategory', () => {
  it('gera o ícone como decorativo (alt vazio)', () => {
    const { container } = render(<div>{getIconForCategory('Cidade')}</div>)

    const image = container.querySelector('img')
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('alt', '')
  })
})

describe('HomeCategoriesGrid (seção "Serviços" da home)', () => {
  it('não repete no alt do ícone o nome visível da categoria', async () => {
    const { container } = render(<HomeCategoriesGrid categories={categories} />)
    await screen.findByRole('heading', { level: 2, name: 'Serviços' })

    const images = container.querySelectorAll('img')
    // Cada categoria aparece na grade mobile e na desktop.
    expect(images).toHaveLength(categories.length * 2)
    for (const image of images) {
      expect(image).toHaveAttribute('alt', '')
    }
  })

  it('nomeia cada link só pelo rótulo visível, uma vez', async () => {
    render(<HomeCategoriesGrid categories={categories} />)
    await screen.findByRole('heading', { level: 2, name: 'Serviços' })

    for (const name of NAMES) {
      const label = getCategoryDisplayName(name)
      const links = screen.getAllByRole('link', { name: label })
      expect(links).toHaveLength(2)
      for (const link of links) {
        expect(link).toHaveAccessibleName(label)
        expect(within(link).queryByRole('img')).toBeNull()
      }
    }
  })
})

describe('Atalhos fixos da grade (additionalCategories)', () => {
  // O atalho "Cursos" não vem de getIconForCategory e repetia "cursos" no alt.
  it('mostra o ícone de Cursos como decorativo na home', async () => {
    const { container } = render(
      <HomeCategoriesGrid categories={aditionalCategoriesFull} />
    )
    await screen.findByRole('heading', { level: 2, name: 'Serviços' })

    const images = container.querySelectorAll('img')
    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      expect(image).toHaveAttribute('alt', '')
    }

    const links = screen.getAllByRole('link', { name: 'Cursos' })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link).toHaveAccessibleName('Cursos')
      expect(within(link).queryByRole('img')).toBeNull()
    }
  })

  it('mantém o nome do botão de Cursos em /servicos', () => {
    const { container } = render(
      <CategoryGrid title="Categorias" categories={additionalCategories} />
    )

    for (const image of container.querySelectorAll('img')) {
      expect(image).toHaveAttribute('alt', '')
    }
    expect(screen.getByRole('button', { name: 'Cursos' })).toBeVisible()
  })
})

describe('CategoryGrid (/servicos)', () => {
  it('mantém o nome acessível do botão, que só contém o ícone', () => {
    const { container } = render(
      <CategoryGrid title="Categorias" categories={categories} />
    )

    for (const image of container.querySelectorAll('img')) {
      expect(image).toHaveAttribute('alt', '')
    }

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(categories.length)
    NAMES.forEach((name, index) => {
      expect(buttons[index]).toHaveAccessibleName(getCategoryDisplayName(name))
    })
  })

  it('dá nome ao botão mesmo quando a categoria não tem ícone', () => {
    render(
      <CategoryGrid
        title="Categorias"
        categories={[{ ...category('Sem ícone'), icon: null }]}
      />
    )

    expect(screen.getByRole('button', { name: 'Sem ícone' })).toBeVisible()
  })
})

import type { CategoryFilter } from '@/lib/course-category-helpers'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryFiltersMobile } from '../category-filters-mobile'
import { CategoryFiltersSwipe } from '../category-filters-swipe'

/**
 * DEV-403 — o ícone do chip de categoria repetia no alt o nome que o mesmo
 * link já mostra em texto, e o leitor de tela anunciava a categoria duas vezes
 * (axe image-redundant-alt em /servicos/cursos).
 */

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

const filters: CategoryFilter[] = [
  { label: 'Dados', value: 'dados', imagePath: '/icons/dados.svg', id: 1 },
  { label: 'Saúde', value: 'saude', imagePath: '/icons/saude.svg', id: 2 },
]

describe.each([
  ['CategoryFiltersMobile', CategoryFiltersMobile],
  ['CategoryFiltersSwipe', CategoryFiltersSwipe],
])('%s (/servicos/cursos)', (_name, Component) => {
  it('mostra o ícone da categoria como decorativo (alt vazio)', () => {
    const { container } = render(<Component categoryFilters={filters} />)

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(filters.length)
    for (const image of images) {
      expect(image).toHaveAttribute('alt', '')
    }
  })

  it('nomeia cada link só pelo rótulo visível, uma vez', () => {
    render(<Component categoryFilters={filters} />)

    for (const filter of filters) {
      const link = screen.getByRole('link', { name: filter.label })
      expect(link).toHaveAccessibleName(filter.label)
      expect(link).toHaveAttribute(
        'href',
        `/servicos/cursos/categoria/${filter.value}`
      )
      expect(within(link).getByText(filter.label)).toBeVisible()
      expect(within(link).queryByRole('img')).toBeNull()
    }
  })
})

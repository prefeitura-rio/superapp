import { slugify } from '@/actions/courses/utils'
import artesImage from '@/assets/course-categories/artes.png'
// Import category images
import astronomiaImage from '@/assets/course-categories/astronomia.png'
import carreiraImage from '@/assets/course-categories/carreira.png'
import cibersegurancaImage from '@/assets/course-categories/ciberseguranca.png'
// TODO: Import images for remaining categories as they are added:
import culturaImage from '@/assets/course-categories/cultura.png'
import dadosImage from '@/assets/course-categories/dados.png'
import designImage from '@/assets/course-categories/design.png'
import educacaoImage from '@/assets/course-categories/educacao.png'
import esteticaImage from '@/assets/course-categories/estetica.png'
import financasImage from '@/assets/course-categories/financas.png'
import gamesImage from '@/assets/course-categories/games.png'
import gastronomiaImage from '@/assets/course-categories/gastronomia.png'
import gestaoImage from '@/assets/course-categories/gestao.png'
import iaImage from '@/assets/course-categories/ia.png'
import marketingImage from '@/assets/course-categories/marketing.png'
import nutricaoImage from '@/assets/course-categories/nutricao.png'
import saudeImage from '@/assets/course-categories/saude.png'
import sustentabilidadeImage from '@/assets/course-categories/sustentabilidade.png'
import tecnologiaImage from '@/assets/course-categories/tecnologia.png'
import veterinariaImage from '@/assets/course-categories/veterinaria.png'
import type { ModelsCategoria } from '@/http-courses/models'
import type { StaticImageData } from 'next/image'

export interface CategoryFilter {
  label: string
  value: string
  imagePath: string | StaticImageData | undefined
  id?: number
}

/**
 * Maps category IDs to imported image modules
 * Only categories with existing images should be included here
 * TODO: Add images for remaining categories
 */
const CATEGORY_IMAGE_MAP: Record<number, StaticImageData | string> = {
  7: astronomiaImage, // ✅ Image exists
  //  TODO: Uncomment and add images for the following categories as they are added:
  22: culturaImage,
  21: artesImage,
  20: sustentabilidadeImage,
  19: esteticaImage,
  18: carreiraImage,
  17: veterinariaImage,
  16: saudeImage,
  15: gastronomiaImage,
  14: educacaoImage,
  13: nutricaoImage,
  12: gamesImage,
  10: financasImage,
  9: marketingImage,
  8: tecnologiaImage,
  5: cibersegurancaImage,
  4: designImage,
  3: iaImage,
  2: gestaoImage,
  1: dadosImage,
}

/**
 * Transforms API categories into filter format for the UI
 * @param categories - Array of categories from the API
 * @returns Array of category filters with label, value (slug), and image path
 */
export function transformCategoriesToFilters(
  categories: ModelsCategoria[]
): CategoryFilter[] {
  return categories
    .filter(category => category.nome && category.id)
    .map(category => {
      const nome = category.nome || ''
      const slug = slugify(nome)
      const categoryId = category.id!

      // Use mapped image if available, otherwise undefined
      // Categories without images won't display an image
      const imagePath = CATEGORY_IMAGE_MAP[categoryId]

      return {
        label: nome,
        value: slug,
        imagePath,
        id: categoryId,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically by label
}

/**
 * Maps category slug to category ID
 * @param categories - Array of category filters
 * @param slug - Category slug to find
 * @returns Category ID if found, undefined otherwise
 */
export function getCategoryIdBySlug(
  categories: CategoryFilter[],
  slug: string
): number | undefined {
  const category = categories.find(cat => cat.value === slug)
  return category?.id
}

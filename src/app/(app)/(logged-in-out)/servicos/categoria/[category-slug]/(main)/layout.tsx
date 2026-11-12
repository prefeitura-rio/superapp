import { lookupCategoryBySlug } from '@/lib/categories'
import { notFound } from 'next/navigation'

/**
 * Checks that the category exists before the page streams. The layout renders
 * above this segment's `loading.tsx`, so `notFound()` here still answers a real
 * 404; called from the page, the loading fallback would have fixed the status
 * at 200. When the catalog cannot be read the page renders as before.
 */
export default async function CategoryListingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ 'category-slug': string }>
}) {
  const { 'category-slug': categorySlug } = await params

  const lookup = await lookupCategoryBySlug(categorySlug)
  if (lookup.status === 'not_found') {
    notFound()
  }

  return children
}

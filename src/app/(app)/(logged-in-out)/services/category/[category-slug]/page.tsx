import CategoryWithRecaptcha from '@/app/components/category-with-recaptcha'
import { getCategoryNameBySlug } from '@/lib/services-utils'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ 'category-slug': string }>
}) {
  const { 'category-slug': categorySlug } = await params
  const categoryName = await getCategoryNameBySlug(categorySlug)

  const userAuthInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

  return (
    <CategoryWithRecaptcha
      categorySlug={categorySlug}
      isLoggedIn={isLoggedIn}
      categoryName={categoryName}
    />
  )
}

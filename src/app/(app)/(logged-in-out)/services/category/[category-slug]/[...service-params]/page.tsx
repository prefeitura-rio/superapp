import ServiceWithRecaptcha from '@/app/components/service-with-recaptcha'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'

export default async function ServicePage({
  params,
}: {
  params: Promise<{ 'category-slug': string; 'service-params': string[] }>
}) {
  const { 'category-slug': categorySlug, 'service-params': serviceParams } =
    await params

  // Extract service ID and collection from params
  const [serviceId, collection] = serviceParams

  if (
    !serviceId ||
    (collection !== 'carioca-digital' && collection !== '1746')
  ) {
    notFound()
  }

  const userAuthInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

  return (
    <ServiceWithRecaptcha
      collection={collection}
      serviceId={serviceId}
      isLoggedIn={isLoggedIn}
    />
  )
}

import { SecondaryHeader } from '@/app/components/secondary-header'
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

export default async function CoursesCertifiedPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(`${REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE}`)
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <SecondaryHeader title="Certificados" />

      <div className="overflow-hidden mt-20 px-4 flex justify-center items-center">
        <p className="block text-lg text-muted-foreground text-center">
          Você ainda não possui nenhum certificado.
        </p>
      </div>

      {/* <div className="relative overflow-hidden mt-15 px-4">
        <MyCertificatesCard />
      </div> */}
    </div>
  )
}

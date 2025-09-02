import { MyCoursesCard } from '@/app/components/courses/my-course-card'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

export default async function MyCoursesPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(`${REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE}`)
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <SecondaryHeader title="Meus cursos" route="/servicos/cursos/opcoes" />
      <div className="relative overflow-hidden mt-16 px-4">
        <MyCoursesCard courses={[]} />
      </div>
    </div>
  )
}

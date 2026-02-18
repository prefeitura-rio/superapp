import { getApiV1EmpregabilidadeOnboardingCpf } from '@/http-courses/empregabilidade-onboarding/empregabilidade-onboarding'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { BemVindoContent } from './bem-vindo-content'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BemVindoPage({ params }: PageProps) {
  const { id } = await params

  // Verifica se é o primeiro acesso do usuário
  try {
    const userInfo = await getUserInfoFromToken()

    if (userInfo.cpf) {
      const response = await getApiV1EmpregabilidadeOnboardingCpf(userInfo.cpf)

      if (response.status === 200 && response.data) {
        // Se primeiro_acesso for false, redireciona direto para o próximo passo
        const isPrimeiroAcesso =
          (response.data as { primeiro_acesso?: boolean }).primeiro_acesso ??
          true

        if (!isPrimeiroAcesso) {
          redirect(`/servicos/empregos/${id}/inscricao/confirmar-informacoes`)
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar primeiro acesso:', error)
    // Em caso de erro, continua mostrando a página de boas-vindas
  }

  return (
    <div className="min-h-lvh pb-10">
      <BemVindoContent vagaId={id} />
    </div>
  )
}

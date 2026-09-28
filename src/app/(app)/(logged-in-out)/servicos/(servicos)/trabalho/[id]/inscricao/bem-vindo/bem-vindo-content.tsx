'use client'

import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { completeOnboarding } from './actions'

interface BemVindoContentProps {
  vagaId: string
  /** Quando em fluxo único (carousel), chamado após sucesso em vez de router.push */
  onContinuarSuccess?: () => void
}

export function BemVindoContent({
  vagaId,
  onContinuarSuccess,
}: BemVindoContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinuar = async () => {
    setIsLoading(true)

    try {
      const result = await completeOnboarding()

      if (result.success) {
        if (onContinuarSuccess) {
          onContinuarSuccess()
        } else {
          router.push(
            `/servicos/trabalho/${vagaId}/inscricao/confirmar-informacoes`
          )
        }
      } else {
        // Falha: mostra toast e redireciona para lista de empregos
        toast.error(result.error || 'Algo deu errado. Tente novamente.')
        router.push('/servicos/trabalho')
      }
    } catch (error) {
      console.error('Erro ao continuar:', error)
      toast.error('Algo deu errado. Tente novamente.')

      setTimeout(() => {
        router.push('/servicos/trabalho')
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <OportunidadesSubHeader
        menuHref="/servicos/trabalho/menu"
        logoHref="/servicos/trabalho"
        showSearchIcon
        searchUrl="/busca?tipo=empregos"
      />
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--card) 0%, var(--background) 100%) top / 100% 210px no-repeat',
        }}
      >
        <div className="px-4 max-w-4xl mx-auto pt-8 pb-10">
          <h1 className="text-3xl font-medium leading-9 text-foreground">
            Bem vindo ao{' '}
            <span className="text-primary">
              Cadastro de oportunidades de Emprego
            </span>
          </h1>
          <div className="text-sm font-normal leading-5 text-foreground-light pt-4 pb-6 space-y-4">
            <p>
              O Oportunidades Cariocas apoia você na busca por uma colocação no
              mercado de trabalho. Ao preencher este formulário, você se
              cadastra no banco de talentos da Prefeitura do Rio, em um processo
              rápido de cerca de 15 minutos.
            </p>
            <p>
              O contato será feito por telefone, WhatsApp ou e-mail, por isso
              mantenha seus dados sempre atualizados.
            </p>
          </div>
          <CustomButton
            size="lg"
            fullWidth
            variant="primary"
            onClick={handleContinuar}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Continuar'}
          </CustomButton>
        </div>
      </div>
    </>
  )
}

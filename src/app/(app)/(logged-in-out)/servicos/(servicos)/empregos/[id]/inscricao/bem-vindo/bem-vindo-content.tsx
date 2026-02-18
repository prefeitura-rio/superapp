'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { completeOnboarding } from './actions'

interface BemVindoContentProps {
  vagaId: string
}

export function BemVindoContent({ vagaId }: BemVindoContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinuar = async () => {
    setIsLoading(true)

    try {
      const result = await completeOnboarding()

      if (result.success) {
        // Sucesso: vai para próxima página
        router.push(`/servicos/empregos/${vagaId}/inscricao/confirmar-informacoes`)
      } else {
        // Falha: mostra toast e redireciona para lista de empregos
        toast.error(result.error || 'Algo deu errado. Tente novamente.')

        // Aguarda um momento para o usuário ver o toast
        setTimeout(() => {
          router.push('/servicos/empregos')
        }, 2000)
      }
    } catch (error) {
      console.error('Erro ao continuar:', error)
      toast.error('Algo deu errado. Tente novamente.')

      setTimeout(() => {
        router.push('/servicos/empregos')
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <SecondaryHeader
          fixed={false}
          className="max-w-4xl mx-auto"
          route={`/servicos/empregos/${vagaId}`}
        />
      </div>
      {/* Espaçamento entre header fixo e conteúdo */}
      <div className="px-4 max-w-4xl mx-auto">
        <ThemeAwareVideo
          source={VIDEO_SOURCES.welcome}
          containerClassName="flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
        />
        <h1 className="text-3xl font-medium leading-9 text-foreground">
          Bem vindo ao{' '}
          <span className="text-primary">
            Cadastro de oportunidades de Emprego
          </span>
        </h1>
        <p className="text-sm font-normal leading-5 text-foreground-light pt-2 pb-6">
          Ao preencher este formulário, você se cadastra no banco de talentos da
          Prefeitura do Rio, em um processo rápido de cerca de 15 minutos.
        </p>
        <CustomButton
          size="lg"
          fullWidth
          variant="primary"
          onClick={handleContinuar}
          className="rounded-full"
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : 'Continuar'}
        </CustomButton>
      </div>
    </>
  )
}

'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import Image from 'next/image'
import Link from 'next/link'
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
      <div className="max-w-4xl mx-auto">
        <SecondaryHeader
          fixed={false}
          className="max-w-4xl mx-auto"
          route={`/servicos/trabalho/${vagaId}`}
          logo={
            <Link href="/servicos/trabalho">
              <Image
                src={oportunidadesCariocasLogoDark}
                alt="Oportunidades Cariocas"
                width={170}
                height={38}
                priority
                className="dark:block hidden"
              />
              <Image
                src={oportunidadesCariocasLogo}
                alt="Oportunidades Cariocas"
                width={170}
                height={38}
                priority
                className="dark:hidden block"
              />
            </Link>
          }
        />
      </div>
      <div className="px-4 max-w-4xl mx-auto pt-8">
        <h1 className="text-3xl font-medium leading-9 text-foreground">
          Bem vindo ao{' '}
          <span className="text-primary">
            Cadastro de oportunidades de Emprego
          </span>
        </h1>
        <div className="text-sm font-normal leading-5 text-foreground-light pt-4 pb-6 space-y-4">
          <p>
            O Oportunidades Cariocas apoia você na busca por uma colocação no
            mercado de trabalho. Ao preencher este formulário, você se cadastra
            no banco de talentos da Prefeitura do Rio, em um processo rápido de
            cerca de 15 minutos.
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
    </>
  )
}

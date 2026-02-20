'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { CurriculoContent } from '../../curriculo/curriculo-content'
import { BemVindoContent } from './bem-vindo/bem-vindo-content'
import { ConfirmarInformacoesContent } from './confirmar-informacoes/confirmar-informacoes-content'
import { PerguntasAdicionaisContent } from './confirmar-informacoes/perguntas-adicionais/perguntas-adicionais-content'
import type {
  ContactUpdateStatus,
  EmpregosUserInfo,
} from './confirmar-informacoes/types'

import 'swiper/css'

interface InformacaoComplementarForPerguntas {
  id: string
  id_vaga: string
  titulo: string
  obrigatorio: boolean
  tipo_campo:
    | 'resposta_curta'
    | 'resposta_numerica'
    | 'selecao_unica'
    | 'selecao_multipla'
  valor_minimo: number | null
  valor_maximo: number | null
  opcoes: string[] | null
  created_at: string
  updated_at: string
}

export type InscricaoStep =
  | 'bem-vindo'
  | 'confirmar-informacoes'
  | 'curriculo'
  | 'perguntas-adicionais'

interface InscricaoFlowCarouselProps {
  vagaId: string
  initialStep: number
  showBemVindo: boolean
  showConfirmarInformacoes: boolean
  hasPerguntasAdicionais: boolean
  userInfo: EmpregosUserInfo
  userAuthInfo: { cpf: string; name: string }
  contactUpdateStatus: ContactUpdateStatus
  initialEscolaridade?: string
  informacoesComplementares: InformacaoComplementarForPerguntas[]
}

export function InscricaoFlowCarousel({
  vagaId,
  initialStep,
  showBemVindo,
  showConfirmarInformacoes,
  hasPerguntasAdicionais,
  userInfo,
  userAuthInfo,
  contactUpdateStatus,
  initialEscolaridade = '',
  informacoesComplementares,
}: InscricaoFlowCarouselProps) {
  const router = useRouter()
  const swiperRef = useRef<SwiperType | null>(null)

  const steps: InscricaoStep[] = []
  if (showBemVindo) steps.push('bem-vindo')
  if (showConfirmarInformacoes) steps.push('confirmar-informacoes')
  steps.push('curriculo')
  if (hasPerguntasAdicionais) steps.push('perguntas-adicionais')

  const safeInitialStep = Math.min(initialStep, Math.max(0, steps.length - 1))
  const [currentIndex, setCurrentIndex] = useState(safeInitialStep)

  const stepsLength = steps.length
  const goToNext = useCallback(() => {
    const next = currentIndex + 1
    if (next < stepsLength) {
      swiperRef.current?.slideNext()
      setCurrentIndex(next)
    }
  }, [currentIndex, stepsLength])

  const confirmarStepIndex = steps.indexOf('confirmar-informacoes')
  const returnUrlConfirmar =
    confirmarStepIndex >= 0
      ? `/servicos/empregos/${vagaId}/inscricao?step=${confirmarStepIndex}`
      : `/servicos/empregos/${vagaId}/inscricao`

  const handleBemVindoSuccess = useCallback(() => {
    goToNext()
  }, [goToNext])

  const handleConfirmarContinuar = useCallback(() => {
    goToNext()
  }, [goToNext])

  const handleCurriculoToNext = useCallback(() => {
    goToNext()
  }, [goToNext])

  const handleCurriculoSuccessClose = useCallback(() => {
    router.push('/servicos/empregos')
  }, [router])

  const handlePerguntasSuccessClose = useCallback(() => {
    router.push('/servicos/empregos')
  }, [router])

  return (
    <>
      <Swiper
        allowTouchMove={false}
        onSwiper={swiper => {
          swiperRef.current = swiper
          if (safeInitialStep > 0) {
            swiper.slideTo(safeInitialStep, 0)
          }
        }}
        onSlideChange={swiper => setCurrentIndex(swiper.activeIndex)}
        initialSlide={safeInitialStep}
        className="overflow-hidden!"
      >
        {showBemVindo && (
          <SwiperSlide key="bem-vindo" className="h-auto!">
            <BemVindoContent
              vagaId={vagaId}
              onContinuarSuccess={handleBemVindoSuccess}
            />
          </SwiperSlide>
        )}
        {showConfirmarInformacoes && (
          <SwiperSlide key="confirmar-informacoes" className="h-auto!">
            <ConfirmarInformacoesContent
              vagaId={vagaId}
              userInfo={userInfo}
              userAuthInfo={userAuthInfo}
              contactUpdateStatus={contactUpdateStatus}
              onContinuar={handleConfirmarContinuar}
              returnUrlForProfile={returnUrlConfirmar}
            />
          </SwiperSlide>
        )}
        <SwiperSlide key="curriculo" className="h-auto!">
          <CurriculoContent
            inscricaoVagaId={vagaId}
            backRoute={`/servicos/empregos/${vagaId}`}
            hasPerguntasAdicionais={hasPerguntasAdicionais}
            initialEscolaridade={initialEscolaridade}
            onContinuarToNext={handleCurriculoToNext}
            onSuccessClose={handleCurriculoSuccessClose}
          />
        </SwiperSlide>
        {hasPerguntasAdicionais && (
          <SwiperSlide key="perguntas-adicionais" className="h-auto!">
            <PerguntasAdicionaisContent
              vagaId={vagaId}
              informacoesComplementares={informacoesComplementares}
              onSuccessClose={handlePerguntasSuccessClose}
              backRoute={`/servicos/empregos/${vagaId}`}
            />
          </SwiperSlide>
        )}
      </Swiper>
    </>
  )
}

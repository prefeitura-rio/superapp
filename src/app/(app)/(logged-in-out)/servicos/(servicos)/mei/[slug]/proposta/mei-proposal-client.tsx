'use client'

import { submitMeiProposal } from '@/actions/mei/submit-proposal'
import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { DurationStep } from './steps/duration-step'
import { ReviewStep } from './steps/review-step'
import { ValueStep } from './steps/value-step'

export interface MeiCompanyData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  telefone: {
    ddi: string
    ddd: string
    valor: string
  }
  email: string
}

export interface MeiProposalFormData {
  value: number
  duration: number
  phone: string
  email: string
  acceptedTerms: boolean
}

interface MeiProposalClientProps {
  slug: string
  companyData: MeiCompanyData
}

type Step = 'value' | 'duration' | 'review'

const STEPS: Step[] = ['value', 'duration', 'review']

export function MeiProposalClient({ slug, companyData }: MeiProposalClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)
  const termsErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentStep = (searchParams.get('step') as Step) || 'value'
  const currentStepIndex = STEPS.indexOf(currentStep)

  const form = useForm<MeiProposalFormData>({
    defaultValues: {
      value: 0,
      duration: 0,
      phone: `(${companyData.telefone.ddd}) ${companyData.telefone.valor}`,
      email: companyData.email,
      acceptedTerms: false,
    },
  })

  const { watch, getValues } = form
  const value = watch('value')
  const duration = watch('duration')
  const acceptedTerms = watch('acceptedTerms')

  const navigateToStep = useCallback(
    (step: Step) => {
      const params = new URLSearchParams(searchParams.toString())
      if (step === 'value') {
        params.delete('step')
      } else {
        params.set('step', step)
      }
      const queryString = params.toString()
      router.push(queryString ? `?${queryString}` : window.location.pathname, {
        scroll: false,
      })
    },
    [router, searchParams]
  )

  const handleBack = useCallback(() => {
    if (currentStepIndex === 0) {
      router.push(`/servicos/mei/${slug}`)
    } else {
      navigateToStep(STEPS[currentStepIndex - 1])
    }
  }, [currentStepIndex, router, slug, navigateToStep])

  const handleNext = useCallback(async () => {
    if (currentStep === 'value') {
      if (value > 0) {
        navigateToStep('duration')
      }
    } else if (currentStep === 'duration') {
      if (duration > 0) {
        navigateToStep('review')
      }
    }
  }, [currentStep, value, duration, navigateToStep])

  const handleSubmit = useCallback(async () => {
    const formData = getValues()

    if (!formData.acceptedTerms) {
      if (termsErrorTimeoutRef.current) {
        clearTimeout(termsErrorTimeoutRef.current)
      }
      setShowTermsError(true)
      termsErrorTimeoutRef.current = setTimeout(() => {
        setShowTermsError(false)
      }, 1000)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitMeiProposal({
        oportunidadeId: Number(slug),
        meiEmpresaId: companyData.cnpj.replace(/\D/g, ''),
        valorProposta: formData.value,
        prazoExecucaoDias: formData.duration,
        aceitaCustosIntegrais: formData.acceptedTerms,
        telefone: formData.phone,
        email: formData.email,
      })

      if (!result.success) {
        console.error('[MEI Proposal] Error:', result.error)
        return
      }

      sessionStorage.setItem('mei_proposal_submitted', 'true')
      router.push(`/servicos/mei/${slug}/proposta/sucesso`)
    } catch (error) {
      console.error('[MEI Proposal] Error submitting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [getValues, slug, router, companyData])

  const isButtonDisabled =
    (currentStep === 'value' && value <= 0) ||
    (currentStep === 'duration' && duration <= 0) ||
    isSubmitting

  const buttonText = currentStep === 'review' ? 'Enviar proposta' : 'Continuar'

  return (
    <FormProvider {...form}>
      <div className="fixed inset-0 w-full bg-background flex flex-col overflow-hidden">
        <div className="w-full max-w-xl mx-auto px-4 flex flex-col h-full">
          {/* Header with back button */}
          <div className="flex-shrink-0 pt-8 pb-4">
            <CustomButton
              className="bg-card text-muted-foreground rounded-full w-11! h-11! min-h-0! p-0! hover:bg-card/80 outline-none focus:ring-0"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ChevronLeftIcon className="text-foreground" />
            </CustomButton>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden py-8">
            {currentStep === 'value' && <ValueStep />}
            {currentStep === 'duration' && <DurationStep />}
            {currentStep === 'review' && (
              <ReviewStep
                companyData={companyData}
                showTermsError={showTermsError}
                slug={slug}
              />
            )}
          </div>

          {/* Footer with buttons */}
          <div className="flex-shrink-0 pb-12">
            {currentStep === 'review' ? (
              <div className="flex gap-3">
                <CustomButton
                  variant="secondary"
                  onClick={() => navigateToStep('value')}
                  disabled={isSubmitting}
                  className="flex-1 rounded-full h-[46px]"
                >
                  Editar
                </CustomButton>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 rounded-full h-[46px] text-sm font-normal transition-all duration-200 ${
                    !acceptedTerms || isSubmitting
                      ? 'bg-card text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-background hover:bg-primary/90'
                  } ${isSubmitting ? 'opacity-50' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      <span>{buttonText}</span>
                    </div>
                  ) : (
                    buttonText
                  )}
                </button>
              </div>
            ) : (
              <CustomButton
                onClick={handleNext}
                disabled={isButtonDisabled}
                className={`w-full rounded-full h-[46px] ${
                  isButtonDisabled
                    ? 'bg-card text-muted-foreground'
                    : 'bg-primary text-background'
                }`}
              >
                {buttonText}
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

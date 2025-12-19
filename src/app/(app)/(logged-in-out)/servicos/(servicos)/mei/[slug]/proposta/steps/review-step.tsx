'use client'

import { InfoIcon } from '@/assets/icons/info-icon'
import { EditIcon } from '@/assets/icons/edit-icon'
import { Checkbox } from '@/components/ui/checkbox'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { MeiCompanyData, MeiProposalFormData } from '../mei-proposal-client'

interface ReviewStepProps {
  companyData: MeiCompanyData
  showTermsError: boolean
  slug: string
}

interface ReviewItemProps {
  label: string
  value: string
  showInfo?: boolean
  showEdit?: boolean
  infoContent?: string
  infoTitle?: string
  onEditClick?: () => void
}

function ReviewItem({
  label,
  value,
  showInfo = false,
  showEdit = false,
  infoContent,
  infoTitle = 'Informação',
  onEditClick,
}: ReviewItemProps) {
  const [showInfoDrawer, setShowInfoDrawer] = useState(false)

  return (
    <>
      <div className="py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-foreground-light">{label}</span>
          {showInfo && infoContent && (
            <button
              type="button"
              onClick={() => setShowInfoDrawer(true)}
              className="text-foreground-light hover:text-foreground transition-colors"
            >
              <InfoIcon className="w-4 h-4" />
            </button>
          )}
          {showEdit && onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="ml-auto text-foreground-light hover:text-foreground transition-colors"
            >
              <EditIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <span className="text-base text-foreground">{value}</span>
      </div>

      {showInfo && infoContent && (
        <BottomSheet
          open={showInfoDrawer}
          onOpenChange={setShowInfoDrawer}
          title={infoTitle}
          showHandle
        >
          <p className="text-foreground-light text-sm leading-relaxed">
            {infoContent}
          </p>
        </BottomSheet>
      )}
    </>
  )
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ReviewStep({ companyData, showTermsError, slug }: ReviewStepProps) {
  const router = useRouter()
  const { watch, setValue } = useFormContext<MeiProposalFormData>()
  const proposalValue = watch('value')
  const duration = watch('duration')
  const phone = watch('phone')
  const email = watch('email')
  const acceptedTerms = watch('acceptedTerms')

  const handlePhoneEdit = () => {
    const returnUrl = `/servicos/mei/${slug}/proposta?step=review`
    router.push(
      `/meu-perfil/informacoes-pessoais/atualizar-telefone?redirectFromMei=${slug}&returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  const handleEmailEdit = () => {
    const returnUrl = `/servicos/mei/${slug}/proposta?step=review`
    router.push(
      `/meu-perfil/informacoes-pessoais/atualizar-email?redirectFromMei=${slug}&returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <h1 className="text-3xl font-medium text-foreground leading-tight mb-6">
        Revise sua proposta antes de enviar
      </h1>

      <div className="flex flex-col">
        <ReviewItem label="CNPJ" value={companyData.cnpj} />
        <ReviewItem label="Razão social" value={companyData.razaoSocial} />
        <ReviewItem label="Nome fantasia" value={companyData.nomeFantasia} />
        <ReviewItem
          label="Valor da sua proposta"
          value={formatCurrency(proposalValue)}
        />
        <ReviewItem
          label="Previsão de duração do serviço (dias)"
          value={`${duration} dias`}
        />
        <ReviewItem
          label="Celular"
          value={phone}
          showInfo
          showEdit
          infoContent="Esse número de telefone será usado apenas no PrefRio. Ele não altera seu celular cadastrado no registro formal de sua empresa."
          onEditClick={handlePhoneEdit}
        />
        <ReviewItem
          label="E-mail"
          value={email}
          showInfo
          showEdit
          infoContent="Esse email será usado apenas no PrefRio. Ele não altera seu email cadastrado no registro formal de sua empresa."
          onEditClick={handleEmailEdit}
        />
      </div>

      {/* Terms checkbox */}
      <div className="mt-6 flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setValue('acceptedTerms', checked === true)}
          className={cn(
            'mt-0.5',
            showTermsError && 'border-destructive'
          )}
        />
        <label
          htmlFor="terms"
          className={cn(
            'text-sm text-foreground-light leading-relaxed cursor-pointer',
            showTermsError && 'text-destructive'
          )}
        >
          Declaro que a minha proposta inclui a integralidade dos custos dos serviços e também dos materiais necessários para a execução do serviço
        </label>
      </div>
    </div>
  )
}

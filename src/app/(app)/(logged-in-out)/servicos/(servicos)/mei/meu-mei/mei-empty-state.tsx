'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { MEI_LINKS } from '@/constants/mei-links'

type MeiEmptyStateVariant = 'meu-mei' | 'propostas'

interface MeiEmptyStateProps {
  variant?: MeiEmptyStateVariant
}

const variantTexts: Record<MeiEmptyStateVariant, string> = {
  'meu-mei':
    'Abra uma empresa para poder realizar orçamentos, executar serviços e gerenciar seus dados. Veja abaixo mais informações sobre como se tornar um Microempreendedor Individual.',
  propostas: 'Abra uma empresa para poder enviar propostas de serviço.',
}

export function MeiEmptyState({ variant = 'meu-mei' }: MeiEmptyStateProps) {
  const handleOpenMeiRegistration = () => {
    window.open(MEI_LINKS.REGISTRATION, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-180px)]">
      <div className="flex-1 pt-8">
        <h1 className="text-3xl font-medium text-foreground leading-tight mb-4">
          Você ainda não possui uma empresa MEI
        </h1>
        <p className="text-foreground-light text-base leading-relaxed">
          {variantTexts[variant]}
        </p>
      </div>

      <div className="pb-safe">
        <CustomButton
          onClick={handleOpenMeiRegistration}
          className="w-full rounded-full h-[46px] bg-primary text-background"
        >
          Quero ser MEI
        </CustomButton>
      </div>
    </div>
  )
}

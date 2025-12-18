'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'

const MEI_REGISTRATION_URL =
  'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei'

export function MeiEmptyState() {
  const handleOpenMeiRegistration = () => {
    window.open(MEI_REGISTRATION_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-180px)]">
      <div className="flex-1">
        <h1 className="text-3xl font-medium text-foreground leading-tight mb-4">
          Você ainda não possui uma empresa MEI
        </h1>
        <p className="text-foreground-light text-base leading-relaxed">
          Abra uma empresa para poder realizar orçamentos, executar serviços e
          gerenciar seus dados. Veja abaixo mais informações sobre como se
          tornar um Microempreendedor Individual.
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

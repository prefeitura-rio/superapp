import { GlobalMenuTrigger } from '@/app/components/global-menu/global-menu-trigger'
import { SecondaryHeader } from '@/app/components/secondary-header'
import type { ReactNode } from 'react'

export const legalTitleCn =
  "text-[color:var(--theme-color-card-foreground,#020618)] font-[family-name:var(--font-family-sans,'DM_Sans')] text-[length:var(--font-size-lg,18px)] font-[var(--font-weight-medium,500)] leading-[var(--font-leading-5,20px)] tracking-[var(--font-tracking-normal,0)]"

export const legalBodyCn =
  "text-[color:var(--theme-color-foreground-light,#71717B)] font-[family-name:var(--font-family-sans,'DM_Sans')] text-[length:var(--font-size-sm,14px)] font-[var(--font-weight-normal,400)] leading-[var(--font-leading-5,20px)] tracking-[var(--font-tracking-normal,0)]"

export function LegalDivider() {
  return <hr className="border-border my-6" />
}

interface LegalDocumentProps {
  title: string
  /** Rodapé de versão do documento, ex.: "Abril de 2026 - Versão 1.0" */
  lastUpdate: string
  children: ReactNode
}

/**
 * Moldura compartilhada dos documentos institucionais (Termos de uso e
 * Política de Privacidade): voltar à esquerda, menu global à direita, título
 * e versão no topo do conteúdo.
 */
export function LegalDocument({
  title,
  lastUpdate,
  children,
}: LegalDocumentProps) {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} rightSlot={<GlobalMenuTrigger />} />

      <div className="px-4 pt-2">
        <h1 className="text-3xl font-medium text-foreground">{title}</h1>
        <p className={`${legalBodyCn} mt-1`}>
          Última atualização: {lastUpdate}
        </p>

        <LegalDivider />

        {children}
      </div>
    </main>
  )
}

'use client'

import { ExternalLinkDrawer } from '@/app/components/drawer-contents/external-link-drawer'
import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import { DIVIDA_ATIVA_EXTERNAL_LINKS } from '@/constants/divida-ativa-links'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Um serviço da landing. Ou é reconstruído aqui (`href`) ou continua no portal legado
 * (`externalUrl`) — nunca os dois. Quem decide não é o front: os três fluxos externos foram
 * retirados do escopo de modernização pela diretoria.
 */
type DividaAtivaServico =
  | { id: string; label: string; tipo: 'interno'; href: string }
  | { id: string; label: string; tipo: 'externo'; externalUrl: string }

const SERVICOS: DividaAtivaServico[] = [
  {
    id: 'guia-a-vista',
    label: 'Emitir guia à vista ou liquidar débitos',
    tipo: 'externo',
    externalUrl: DIVIDA_ATIVA_EXTERNAL_LINKS.GUIA_A_VISTA,
  },
  {
    id: 'guia-parcela-em-atraso',
    label: 'Emitir guia – parcela em atraso (regularização)',
    tipo: 'externo',
    externalUrl: DIVIDA_ATIVA_EXTERNAL_LINKS.GUIA_PARCELA_EM_ATRASO,
  },
  {
    id: 'segunda-via-guia',
    label: 'Emitir segunda via de guia de pagamento',
    tipo: 'externo',
    externalUrl: DIVIDA_ATIVA_EXTERNAL_LINKS.SEGUNDA_VIA_GUIA,
  },
  {
    id: 'parcelar-debitos',
    label: 'Parcelar débitos',
    tipo: 'interno',
    href: '/divida-ativa/parcelamento',
  },
  {
    id: 'acompanhar-requerimento',
    label: 'Acompanhar requerimento de parcelamento',
    tipo: 'interno',
    href: '/divida-ativa/acompanhamento',
  },
]

const itemClassName =
  'flex w-full items-center justify-between gap-4 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-card/50'

const labelClassName = 'text-sm font-normal leading-5 text-foreground'

export function DividaAtivaServiceList() {
  const [externalUrl, setExternalUrl] = useState<string | null>(null)

  return (
    <>
      <ul className="flex flex-col gap-2">
        {SERVICOS.map(servico => (
          <li key={servico.id}>
            {servico.tipo === 'interno' ? (
              <Link href={servico.href} className={itemClassName}>
                <span className={labelClassName}>{servico.label}</span>
                <ChevronRightIcon className="shrink-0 text-muted-foreground" />
              </Link>
            ) : (
              <button
                type="button"
                className={itemClassName}
                onClick={() => setExternalUrl(servico.externalUrl)}
              >
                <span className={labelClassName}>{servico.label}</span>
                <ChevronRightIcon className="shrink-0 text-muted-foreground" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <ExternalLinkDrawer
        open={externalUrl !== null}
        onOpenChange={open => {
          if (!open) {
            setExternalUrl(null)
          }
        }}
        externalUrl={externalUrl ?? ''}
        title="Vamos lhe redirecionar para um link externo"
        description="Este recurso está disponível em outra página oficial da Prefeitura do Rio de Janeiro"
      />
    </>
  )
}

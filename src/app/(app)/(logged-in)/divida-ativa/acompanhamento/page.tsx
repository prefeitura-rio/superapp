import { ConsultaProtocoloForm } from '@/app/components/divida-ativa/consulta-protocolo-form'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import Link from 'next/link'

/**
 * Entrada do acompanhamento de requerimento de parcelamento — Fase 3 (Marco 3, 23/10/2026).
 *
 * Dois caminhos para o mesmo endpoint (`GET /divida-ativa/requerimentos`):
 * - **Meus requerimentos** — sem parâmetro, a API lista os requerimentos do CPF do token.
 * - **Consultar pelo n° do protocolo** — com `?protocolo=`, a API busca um requerimento e
 *   confere se ele é deste CPF.
 *
 * Esta tela não chama a API: ela só leva o cidadão à lista ou ao requerimento do número
 * digitado. Server Component — o único trecho interativo é o formulário.
 */
export default function AcompanhamentoPage() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-4xl" route="/divida-ativa" />

      <div className="flex flex-1 flex-col px-4">
        <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
          Acompanhar requerimento de parcelamento
        </h1>

        <Link
          href="/divida-ativa/acompanhamento/requerimentos"
          className="flex w-full items-center justify-between gap-4 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-secondary active:bg-secondary"
        >
          <span className="text-sm font-normal leading-5 text-foreground">
            Meus requerimentos
          </span>
          <ChevronRightIcon className="shrink-0 text-muted-foreground" />
        </Link>

        <hr className="my-6 border-t border-dashed border-border" />

        <ConsultaProtocoloForm />
      </div>
    </div>
  )
}

import { ComprovanteRequerimento } from '@/app/components/divida-ativa/comprovante-requerimento'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'
import { Suspense } from 'react'

/** `dd/MM/yyyy`, como o DAM devolve; qualquer outra coisa é descartada. */
function prazoValido(valor: string | undefined): string | null {
  return valor && /^\d{2}\/\d{2}\/\d{4}$/.test(valor) ? valor : null
}

/**
 * "Sua solicitação de parcelamento foi enviada!" — tela 11.
 *
 * Recebe pela URL o que a API devolveu no envio:
 * - `?protocolo=` — em destaque. Ausente (acesso direto), a confirmação sai sem o número: o
 *   cidadão o recebe por e-mail e WhatsApp de qualquer forma.
 * - `?prazo=` — `datPrevisaoEntrega`, a data até a qual a PGM responde, como no protocolo do
 *   portal legado. Sem ela, vale o texto genérico de até 10 dias úteis.
 *
 * O comprovante **não** vem pela URL: a URL do DAM pode levar token. `ComprovanteRequerimento`
 * o busca no servidor pelo protocolo, em streaming, para a confirmação não esperar o ePortal.
 */
export default async function RequerimentoSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{
    protocolo?: string
    prazo?: string
  }>
}) {
  const params = await searchParams
  const { protocolo } = params
  const prazo = prazoValido(params.prazo)

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-4xl" route="/divida-ativa" />

      <div className="flex flex-1 flex-col px-4">
        <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
          Sua solicitação de parcelamento foi enviada!
        </h1>

        {protocolo && (
          <p className="pb-4 text-xl font-medium leading-7 text-primary">
            Protocolo {protocolo}
          </p>
        )}

        <p className="text-sm font-normal leading-5 text-foreground-light">
          {prazo
            ? `A Procuradoria vai analisar o pedido e responder até ${prazo}.`
            : 'A análise do pedido de parcelamento da Dívida Ativa pode levar até 10 dias úteis para ser aprovada.'}{' '}
          Você receberá um e-mail e uma mensagem por WhatsApp com o resultado da
          sua solicitação.
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          {protocolo && (
            <Suspense fallback={null}>
              <ComprovanteRequerimento protocolo={protocolo} />
            </Suspense>
          )}
          <CustomButton asChild variant="primary" size="lg" fullWidth>
            <Link href="/divida-ativa">Voltar para tela inicial</Link>
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

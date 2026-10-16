import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'

/**
 * "Sua solicitação de parcelamento foi enviada!" — tela 11.
 *
 * Recebe o protocolo via `?protocolo=` para exibi-lo em destaque. Se o parâmetro estiver
 * ausente (acesso direto à URL), mostra a confirmação sem o número — a solicitação já foi
 * enviada e o cidadão recebe o protocolo por e-mail e WhatsApp de qualquer forma.
 */
export default async function RequerimentoSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ protocolo?: string }>
}) {
  const { protocolo } = await searchParams

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-4xl" route="/divida-ativa" />

      <div className="flex flex-1 flex-col px-4">
        <h1 className="pt-2 pb-4 text-3xl font-medium leading-9 text-foreground">
          Sua solicitação de parcelamento foi enviada!
        </h1>

        {protocolo && (
          <p className="pb-4 text-base font-medium leading-6 text-primary">
            Protocolo {protocolo}
          </p>
        )}

        <p className="text-sm font-normal leading-5 text-foreground-light">
          A análise do pedido de parcelamento da Dívida Ativa pode levar até 10
          dias úteis para ser aprovada. Você receberá um e-mail e uma mensagem
          por WhatsApp com o resultado da sua solicitação.
        </p>

        <div className="mt-auto pt-6">
          <CustomButton asChild variant="primary" size="lg" fullWidth>
            <Link href="/divida-ativa">Voltar para tela inicial</Link>
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

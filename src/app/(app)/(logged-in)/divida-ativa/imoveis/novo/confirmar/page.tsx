import { ConfirmarImovel } from '@/app/components/divida-ativa/confirmar-imovel'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { getDalDividaAtivaConsultaInscricao } from '@/lib/dal'
import {
  isInscricaoImobiliariaValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import Link from 'next/link'
import { redirect } from 'next/navigation'

/**
 * Segundo passo do cadastro: consulta a inscrição no sistema fiscal e mostra o que veio para
 * o cidadão conferir. **Ainda não grava** — quem grava é o "Confirmar", que dispara a Server
 * Action. No portal legado a consulta já cadastrava; a separação é deliberada (premissa P20).
 *
 * A inscrição vem por query param porque é estado compartilhável de UI, e a consulta acontece
 * aqui no servidor: assim o token não precisa chegar ao browser.
 */
export default async function ConfirmarImovelPage({
  searchParams,
}: {
  searchParams: Promise<{ inscricao?: string; nome?: string }>
}) {
  const { inscricao, nome } = await searchParams

  // Sem um número plausível não há o que confirmar: volta para o campo em vez de consultar.
  if (!inscricao || !isInscricaoImobiliariaValida(inscricao)) {
    redirect('/divida-ativa/imoveis/novo')
  }

  const inscricaoLimpa = somenteDigitos(inscricao)
  const { cpf } = await getUserInfoFromToken()
  const imovel = await getDalDividaAtivaConsultaInscricao(inscricaoLimpa, cpf)

  // Voltar preserva o nome digitado: quem revisa não perde o que escreveu no passo anterior.
  const voltarParams = new URLSearchParams({ inscricao: inscricaoLimpa })
  if (nome) voltarParams.set('nome', nome)
  const voltarHref = `/divida-ativa/imoveis/novo/nome?${voltarParams.toString()}`

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-4xl" route={voltarHref} />

      {imovel ? (
        <ConfirmarImovel imovel={imovel} nome={nome} voltarHref={voltarHref} />
      ) : (
        <InscricaoNaoEncontrada />
      )}
    </div>
  )
}

function InscricaoNaoEncontrada() {
  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Não encontramos essa inscrição
      </h1>

      <p className="text-sm font-normal leading-5 text-foreground-light">
        Confira o número no canto superior direito do boleto que você recebeu no
        endereço do imóvel e tente de novo.
      </p>

      <CustomButton
        asChild
        variant="primary"
        size="lg"
        fullWidth
        className="mt-auto"
      >
        <Link href="/divida-ativa/imoveis/novo">Digitar outro número</Link>
      </CustomButton>
    </div>
  )
}

import { NomeImovelForm } from '@/app/components/divida-ativa/nome-imovel-form'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  isInscricaoImobiliariaValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { redirect } from 'next/navigation'

/**
 * Último passo do cadastro: um nome para o imóvel, depois da confirmação. O "Continuar"
 * daqui dispara a Server Action que grava — a inscrição chega pela URL (estado
 * compartilhável de UI, padrão do módulo), já confirmada no passo anterior.
 */
export default async function NomeImovelPage({
  searchParams,
}: {
  searchParams: Promise<{ inscricao?: string }>
}) {
  const { inscricao } = await searchParams

  // Sem inscrição plausível o passo não tem contexto: volta para o campo.
  if (!inscricao || !isInscricaoImobiliariaValida(inscricao)) {
    redirect('/divida-ativa/imoveis/novo')
  }

  const inscricaoLimpa = somenteDigitos(inscricao)

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={`/divida-ativa/imoveis/novo/confirmar?inscricao=${inscricaoLimpa}`}
      />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Escreva um nome para esse imóvel
      </h1>

      <NomeImovelForm inscricao={inscricaoLimpa} />
    </div>
  )
}

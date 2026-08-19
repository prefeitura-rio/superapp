import { NomeImovelForm } from '@/app/components/divida-ativa/nome-imovel-form'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  isInscricaoImobiliariaValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { redirect } from 'next/navigation'

/**
 * Segundo passo do cadastro: um nome para o imóvel, entre a digitação da inscrição e a
 * confirmação. Nada é consultado nem gravado aqui — a inscrição e o nome só transitam pela
 * URL (estado compartilhável de UI, padrão do módulo).
 */
export default async function NomeImovelPage({
  searchParams,
}: {
  searchParams: Promise<{ inscricao?: string; nome?: string }>
}) {
  const { inscricao, nome } = await searchParams

  // Sem inscrição plausível o passo não tem contexto: volta para o campo.
  if (!inscricao || !isInscricaoImobiliariaValida(inscricao)) {
    redirect('/divida-ativa/imoveis/novo')
  }

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/imoveis/novo"
      />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Escreva um nome para esse imóvel
      </h1>

      <NomeImovelForm
        inscricao={somenteDigitos(inscricao)}
        nomeInicial={nome}
      />
    </div>
  )
}

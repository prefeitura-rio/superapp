import { EditarNomeImovelForm } from '@/app/components/divida-ativa/editar-nome-imovel-form'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaImoveis } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'

/**
 * Edição do nome de um imóvel já cadastrado, aberta pelo menu de ações do card.
 *
 * O imóvel sai da própria lista do cidadão em vez de um `GET /imoveis/{id}` — que a API não
 * tem — e isso resolve a autorização de graça: `GET /imoveis` devolve **só** o que pertence
 * ao CPF do token, então um id de outra pessoa simplesmente não aparece aqui e vira 404.
 * A leitura é barata: o endpoint lê apenas o banco local e responde em menos de 100 ms.
 */
export default async function EditarNomeImovelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const idNumerico = Number(id)

  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    notFound()
  }

  const { cpf } = await getUserInfoFromToken()
  const imoveis = await getDalDividaAtivaImoveis(cpf)
  const imovel = imoveis.find(item => item.id === idNumerico)

  if (!imovel) {
    notFound()
  }

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/imoveis"
      />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Edite o nome desse imóvel
      </h1>

      <EditarNomeImovelForm
        id={imovel.id ?? idNumerico}
        nomeAtual={imovel.nome}
      />
    </div>
  )
}

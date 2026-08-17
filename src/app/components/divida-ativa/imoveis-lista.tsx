import { ExcluirImovelButton } from '@/app/components/divida-ativa/excluir-imovel-button'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { formatarInscricaoImobiliaria } from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import Link from 'next/link'

interface ImoveisListaProps {
  imoveis: ImovelDividaAtiva[]
}

const ADICIONAR_HREF = '/divida-ativa/imoveis/novo'

export function ImoveisLista({ imoveis }: ImoveisListaProps) {
  if (imoveis.length === 0) return <ImoveisVazio />

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {imoveis.map(imovel => (
          <li key={imovel.id ?? imovel.inscricao}>
            <ImovelCard imovel={imovel} />
          </li>
        ))}
      </ul>

      <AdicionarImovelLink />
    </div>
  )
}

function ImovelCard({ imovel }: { imovel: ImovelDividaAtiva }) {
  const inscricaoFormatada = formatarInscricaoImobiliaria(imovel.inscricao)
  // Um imóvel sem endereço ainda precisa ser distinguível na lista e no aviso de exclusão.
  const descricao = imovel.endereco ?? inscricaoFormatada

  return (
    <article className="flex items-start gap-4 rounded-2xl bg-card p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          {imovel.endereco && (
            <h2 className="text-base font-normal leading-6 text-foreground">
              {imovel.endereco}
            </h2>
          )}
          {imovel.bairro && (
            <p className="text-sm font-normal leading-5 text-foreground-light">
              {imovel.bairro}
            </p>
          )}
        </div>

        <CampoImovel
          rotulo="Inscrição imobiliária"
          valor={inscricaoFormatada}
        />

        {imovel.proprietario && (
          <CampoImovel rotulo="Proprietário" valor={imovel.proprietario} />
        )}
      </div>

      {/* Sem id local não há como pedir a exclusão à API — a lixeira não aparece em vez
          de aparecer e falhar. A API sempre devolve o id; isto é rede de segurança. */}
      {imovel.id !== null && (
        <ExcluirImovelButton id={imovel.id} descricao={descricao} />
      )}
    </article>
  )
}

function CampoImovel({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-sm font-normal leading-5 text-foreground-light">
        {rotulo}
      </p>
      <p className="text-sm font-normal leading-5 text-foreground">{valor}</p>
    </div>
  )
}

function ImoveisVazio() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-6 text-center">
        <p className="text-base font-normal leading-6 text-foreground">
          Nenhum imóvel cadastrado
        </p>
        <p className="text-sm font-normal leading-5 text-foreground-light">
          Cadastre um imóvel para consultar seus débitos e parcelar sem precisar
          digitar a inscrição imobiliária toda vez.
        </p>
      </div>

      {/* Sem imóvel, adicionar é a única ação da tela — por isso vem como botão primário,
          e não como mais um item de lista. */}
      <CustomButton asChild variant="primary" size="lg" fullWidth>
        <Link href={ADICIONAR_HREF}>Adicionar imóvel</Link>
      </CustomButton>
    </div>
  )
}

function AdicionarImovelLink() {
  return (
    <Link
      href={ADICIONAR_HREF}
      className="flex w-full items-center justify-center rounded-2xl bg-card p-4 text-sm font-normal leading-5 text-foreground transition-colors hover:bg-card/50"
    >
      Adicionar imóvel
    </Link>
  )
}

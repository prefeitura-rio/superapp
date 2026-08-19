import { ExcluirImovelButton } from '@/app/components/divida-ativa/excluir-imovel-button'
import { ImovelResumoCard } from '@/app/components/divida-ativa/imovel-resumo-card'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { formatarInscricaoImobiliaria } from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import Link from 'next/link'

interface ImoveisListaProps {
  imoveis: ImovelDividaAtiva[]
}

const ADICIONAR_HREF = '/divida-ativa/imoveis/novo'

export function ImoveisLista({ imoveis }: ImoveisListaProps) {
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
  // Um imóvel sem nome e sem endereço ainda precisa ser distinguível no aviso de exclusão.
  const descricao =
    imovel.nome ??
    imovel.endereco ??
    formatarInscricaoImobiliaria(imovel.inscricao)

  return (
    <ImovelResumoCard
      imovel={imovel}
      acao={
        // Sem id local não há como pedir a exclusão à API — a lixeira não aparece em vez
        // de aparecer e falhar. A API sempre devolve o id; isto é rede de segurança.
        imovel.id !== null ? (
          <ExcluirImovelButton id={imovel.id} descricao={descricao} />
        ) : undefined
      }
    />
  )
}

/**
 * Estado vazio conforme o Figma: a mensagem ocupa o lugar do título da página (a rota
 * suprime o h1 "Meus imóveis" neste caso — por isso o componente é exportado em vez de
 * interno à lista) e o CTA fica preso ao rodapé, o que depende do pai ser uma coluna
 * flex com altura de viewport.
 */
export function ImoveisVazio() {
  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 text-3xl font-medium leading-9 text-foreground">
        Não encontramos nenhum imóvel cadastrado no seu CPF
      </h1>

      <CustomButton
        asChild
        variant="primary"
        size="lg"
        fullWidth
        className="mt-auto"
      >
        <Link href={ADICIONAR_HREF}>Adicionar imóvel</Link>
      </CustomButton>
    </div>
  )
}

function AdicionarImovelLink() {
  return (
    <Link
      href={ADICIONAR_HREF}
      className="flex w-full items-center justify-center rounded-2xl bg-card p-4 text-sm font-normal leading-5 text-foreground transition-colors hover:bg-secondary active:bg-secondary"
    >
      Adicionar imóvel
    </Link>
  )
}

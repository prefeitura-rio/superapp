import { formatarInscricaoImobiliaria } from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'

interface ImovelResumoCardProps {
  imovel: ImovelDividaAtiva
  /** Ação alinhada à linha da inscrição (ex.: o botão de excluir da lista). */
  acao?: React.ReactNode
}

/**
 * Card de resumo de um imóvel, compartilhado entre "Meus imóveis" e a confirmação do
 * cadastro — o Figma desenha os dois idênticos: nome dado pelo cidadão como título,
 * endereço (com bairro) e inscrição mascarada.
 *
 * Cada linha some quando não há dado — linha vazia é pior que linha ausente. O nome falta
 * na confirmação por construção (o cidadão só o escolhe no passo seguinte) e falta na
 * lista quando ele pulou o passo; bairro e proprietário faltam sempre, porque a API não
 * os devolve (premissas P22 e P19).
 */
export function ImovelResumoCard({ imovel, acao }: ImovelResumoCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card p-4">
      {imovel.nome && (
        <h2 className="text-xl font-semibold leading-7 text-foreground">
          {imovel.nome}
        </h2>
      )}

      {imovel.endereco && (
        <div>
          <p className="text-sm font-normal leading-5 text-foreground-light">
            Endereço
          </p>
          <p className="text-base font-normal leading-6 text-foreground">
            {imovel.endereco}
          </p>
          {imovel.bairro && (
            <p className="text-base font-normal leading-6 text-foreground">
              {imovel.bairro}
            </p>
          )}
        </div>
      )}

      {imovel.proprietario && (
        <div>
          <p className="text-sm font-normal leading-5 text-foreground-light">
            Proprietário
          </p>
          <p className="text-sm font-normal leading-5 text-foreground">
            {imovel.proprietario}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-normal leading-5 text-foreground-light">
            Inscrição imobiliária
          </p>
          <p className="text-sm font-normal leading-5 text-foreground">
            {formatarInscricaoImobiliaria(imovel.inscricao)}
          </p>
        </div>

        {acao}
      </div>
    </article>
  )
}

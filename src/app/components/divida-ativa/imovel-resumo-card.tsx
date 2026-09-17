import { formatarInscricaoImobiliaria } from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'

interface ImovelResumoCardProps {
  imovel: ImovelDividaAtiva
  /**
   * Ação do card, ancorada no **topo à direita** (o menu de três pontinhos da lista). Fica
   * fora da coluna de conteúdo para não descer junto quando o imóvel tem nome, endereço
   * longo ou proprietário — a posição é a mesma em todo card, tenha ele uma linha ou quatro.
   */
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
    <article className="flex items-start gap-4 rounded-2xl bg-card p-4">
      {/* `min-w-0` deixa o endereço quebrar linha em vez de esticar o card e empurrar a
          ação para fora — sem ele, o mínimo intrínseco do texto vence o flex. */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
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

        <div>
          <p className="text-sm font-normal leading-5 text-foreground-light">
            Inscrição imobiliária
          </p>
          <p className="text-sm font-normal leading-5 text-foreground">
            {formatarInscricaoImobiliaria(imovel.inscricao)}
          </p>
        </div>
      </div>

      {acao}
    </article>
  )
}

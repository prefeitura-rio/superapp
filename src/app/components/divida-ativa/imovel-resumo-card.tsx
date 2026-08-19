import { formatarInscricaoImobiliaria } from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'

interface ImovelResumoCardProps {
  imovel: ImovelDividaAtiva
  /**
   * Nome a exibir no lugar do `imovel.nome` — a confirmação usa o que o cidadão acabou de
   * digitar, que ainda não existe no imóvel consultado (premissa P23).
   */
  nome?: string | null
  /** Ação alinhada à linha da inscrição (ex.: o botão de excluir da lista). */
  acao?: React.ReactNode
}

/**
 * Card de resumo de um imóvel, compartilhado entre "Meus imóveis" e a confirmação do
 * cadastro — o Figma desenha os dois idênticos: nome dado pelo cidadão como título,
 * endereço (com bairro) e inscrição mascarada.
 *
 * Nome, bairro e proprietário somem quando não há dado (premissas P23, P22 e P19): a API
 * ainda não os devolve, e linha vazia é pior que linha ausente.
 */
export function ImovelResumoCard({
  imovel,
  nome,
  acao,
}: ImovelResumoCardProps) {
  const nomeExibido = nome ?? imovel.nome

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card p-4">
      {nomeExibido && (
        <h2 className="text-xl font-semibold leading-7 text-foreground">
          {nomeExibido}
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

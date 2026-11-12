import { formatarDataCurta, formatarProtocolo } from '@/lib/divida-ativa-utils'
import type { RequerimentoDividaAtiva } from '@/types/divida-ativa'

/** Qual dado abre o card em destaque — o que o cidadão usou para chegar até ele. */
export type DestaqueRequerimento = 'contribuinte' | 'protocolo'

interface RequerimentoCardProps {
  requerimento: RequerimentoDividaAtiva
  /**
   * Na lista do CPF o destaque é o **contribuinte** (o que distingue um requerimento do
   * outro); na consulta por protocolo é o **protocolo** (o que o cidadão acabou de
   * digitar). Os demais dados são os mesmos, em linhas rótulo/valor.
   */
  destaque: DestaqueRequerimento
}

/** Rótulo acima e valor em destaque abaixo. */
function Destaque({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1 pb-3">
      <span className="text-sm font-normal leading-5 text-foreground-light">
        {rotulo}
      </span>
      <span className="text-xl font-medium leading-7 text-foreground">
        {valor}
      </span>
    </div>
  )
}

/** Uma linha rótulo/valor — some quando não há valor. */
function Linha({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  if (!valor) return null
  return (
    <div className="flex flex-wrap gap-x-1">
      <span className="text-sm font-normal leading-5 text-foreground-light">
        {rotulo}
      </span>
      <span className="text-sm font-normal leading-5 text-foreground">
        {valor}
      </span>
    </div>
  )
}

/**
 * Um requerimento de parcelamento no acompanhamento.
 *
 * Tudo aqui é o que o DAM devolveu: o "Andamento" é o texto da situação que ele manda e,
 * quando ele não manda, o id cru — melhor que inventar um rótulo. A "Descrição" é o motivo
 * de rejeição, texto institucional. Linha sem valor some, em vez de mostrar "—".
 */
export function RequerimentoCard({
  requerimento,
  destaque,
}: RequerimentoCardProps) {
  const protocolo = formatarProtocolo(requerimento.protocolo, requerimento.ano)
  const contribuinte = requerimento.contribuinte
  const andamento = requerimento.situacao ?? requerimento.situacaoId

  return (
    <article className="flex flex-col gap-1 rounded-2xl bg-card p-4">
      {destaque === 'contribuinte' && contribuinte ? (
        <>
          <Destaque rotulo="Contribuinte" valor={contribuinte} />
          <Linha rotulo="N° de protocolo" valor={protocolo} />
        </>
      ) : (
        <>
          <Destaque rotulo="N° de protocolo" valor={protocolo} />
          <Linha rotulo="Contribuinte" valor={contribuinte} />
        </>
      )}

      <Linha
        rotulo="Abertura"
        valor={formatarDataCurta(requerimento.abertoEm)}
      />
      <Linha
        rotulo="Previsão de retorno"
        valor={formatarDataCurta(requerimento.previsaoRetornoEm)}
      />
      <Linha
        rotulo="Data da resposta"
        valor={formatarDataCurta(requerimento.respondidoEm)}
      />
      <Linha rotulo="Andamento" valor={andamento} />

      {requerimento.motivoRejeicao && (
        <div className="flex flex-col">
          <span className="text-sm font-normal leading-5 text-foreground-light">
            Descrição
          </span>
          <span className="text-sm font-normal leading-5 text-foreground">
            {requerimento.motivoRejeicao}
          </span>
        </div>
      )}
    </article>
  )
}

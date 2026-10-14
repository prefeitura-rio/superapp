'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { formatarValorBRL } from '@/lib/divida-ativa-utils'
import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import { FileTextIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

/** Uma linha rótulo/valor do resumo e dos cards por CDA. Some quando não há valor. */
function Linha({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  if (!valor) return null

  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-sm font-normal leading-5 text-foreground-light">
        {rotulo}
      </dt>
      <dd className="text-sm font-normal leading-5 text-foreground">{valor}</dd>
    </div>
  )
}

/**
 * Placeholder da "Lista de GRERJ" — execução fiscal e valor associados.
 *
 * ⚠️ **Dado mockado, não a API.** Não existe hoje campo algum em `DebitoDividaAtiva`,
 * `CdaSimulacaoItemResponse` ou qualquer resposta da `api-imoveis` que traga execução fiscal
 * + valor nesta etapa — o único "Grerj" do contrato é `GuiaDamResponse.grerjs`, que pertence
 * a uma guia **já emitida**, dado completamente diferente do que esta tela mostra antes da
 * simulação. Foi pedido explicitamente pelo time de produto para a tela não ficar sem essa
 * seção enquanto a fonte real não é mapeada — mas o valor abaixo **não é do cidadão**.
 *
 * TODO(divida-ativa): substituir por dado real assim que a API expuser o campo, ou remover a
 * seção caso se confirme que esta etapa não tem GRERJ nenhum para mostrar.
 */
const GRERJ_MOCK = {
  numeroExecucaoFiscal: '0148951-31.3245.3.19.0001',
  valor: 757.6,
}

interface RevisaoPagamentoProps {
  /** CDAs escolhidas na tela anterior, já filtradas pela seleção do cidadão. */
  cdas: DebitoDividaAtiva[]
  /** Para onde o "Continuar"/"Requerer parcelamento" leva — a etapa de simulação (data). */
  rotaContinuar: string
}

/**
 * "Revise as informações de pagamento" — resumo antes de seguir para a simulação.
 *
 * Fica entre a seleção de débitos e a simulação: o cidadão vê os totais e o detalhe de cada
 * CDA escolhida antes de a tela seguinte perguntar a data de vencimento.
 *
 * ### Desconto sempre R$0,00
 *
 * `DebitoDividaAtiva` não tem campo de desconto — ele só existe depois da simulação
 * (`CdaSimulacaoItemResponse.descontoPrincipal`/`descontoHonorarios`). Mostrar a linha fixa
 * em zero segue o Figma sem inventar um valor que a API ainda não calculou nesta etapa.
 *
 * ### Sem nova chamada à API
 *
 * Os dados vêm inteiramente de `DebitoDividaAtiva[]`, a mesma forma que a tela de seleção já
 * exibe — nada daqui depende de um endpoint novo.
 */
export function RevisaoPagamento({
  cdas,
  rotaContinuar,
}: RevisaoPagamentoProps) {
  const router = useRouter()

  const saldoPrincipalTotal = cdas.reduce(
    (total, cda) => total + (cda.valorPrincipal ?? 0),
    0
  )
  const honorariosTotal = cdas.reduce(
    (total, cda) => total + (cda.valorHonorarios ?? 0),
    0
  )

  function requererParcelamento() {
    router.push(rotaContinuar)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Revise as informações de pagamento
      </h1>

      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
        <span className="text-2xl font-medium leading-8 text-foreground">
          {formatarValorBRL(saldoPrincipalTotal) ?? 'R$0,00'}
        </span>
        <span className="text-sm font-normal leading-5 text-foreground-light">
          Saldo principal total
        </span>

        <dl className="flex flex-col gap-1 pt-3">
          <Linha rotulo="Desconto principal total" valor="R$0,00" />
          <Linha
            rotulo="Honorários total"
            valor={formatarValorBRL(honorariosTotal) ?? 'R$0,00'}
          />
          <Linha rotulo="Desconto honorários total" valor="R$0,00" />
        </dl>
      </div>

      <ul className="flex flex-col gap-2 pt-6">
        {cdas.map(cda => (
          <li
            key={cda.numeroCda}
            className="flex flex-col gap-3 rounded-2xl bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <FileTextIcon className="size-4 text-foreground" aria-hidden />
              </span>
              {cda.natureza && (
                <h2 className="text-base font-medium leading-6 text-foreground">
                  {cda.natureza}
                </h2>
              )}
            </div>

            <dl className="flex flex-col gap-1">
              <Linha rotulo="Certidões" valor={cda.numeroCda || null} />
              <Linha rotulo="Contribuinte" valor={cda.contribuinte} />
              <Linha
                rotulo="Natureza da dívida"
                valor={cda.receita ?? cda.natureza}
              />
              <Linha
                rotulo="Saldo principal"
                valor={formatarValorBRL(cda.valorPrincipal)}
              />
              <Linha rotulo="Desconto principal" valor="R$0,00" />
              <Linha
                rotulo="Honorários"
                valor={formatarValorBRL(cda.valorHonorarios)}
              />
              <Linha rotulo="Desconto honorários" valor="R$0,00" />
            </dl>
          </li>
        ))}
      </ul>

      {/* Ver aviso no componente GRERJ_MOCK acima: dado de exemplo, não da API. */}
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 mt-2">
        <h2 className="text-base font-medium leading-6 text-foreground">
          Lista de GRERJ
        </h2>

        <dl className="flex flex-col gap-1">
          <Linha
            rotulo="Execução fiscal"
            valor={GRERJ_MOCK.numeroExecucaoFiscal}
          />
          <Linha rotulo="Valor" valor={formatarValorBRL(GRERJ_MOCK.valor)} />
        </dl>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        {/* "Imprimir Guia a Vista" ainda não tem regra de negócio definida nesta etapa —
            desabilitado de propósito até a próxima PR. */}
        <CustomButton
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          disabled
        >
          Imprimir Guia a Vista
        </CustomButton>

        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={requererParcelamento}
        >
          Requerer parcelamento
        </CustomButton>
      </div>
    </div>
  )
}

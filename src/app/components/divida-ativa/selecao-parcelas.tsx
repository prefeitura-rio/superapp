'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { Input } from '@/components/ui/input'
import { formatarValorBRL } from '@/lib/divida-ativa-utils'
import type { ResultadoSimulacao } from '@/types/divida-ativa'
import { useRouter, useSearchParams } from 'next/navigation'
import { useId, useState } from 'react'

type SimulacaoOk = Extract<ResultadoSimulacao, { situacao: 'ok' }>
type OpcaoParcela = SimulacaoOk['opcoes'][number]

/**
 * Quantidades listadas por padrão, quando a simulação as oferece.
 *
 * O DAM chega a 84 opções; listar todas poluía a tela. Ficam as escolhas mais comuns — à
 * vista, poucas parcelas e os múltiplos de 12 — e o resto vai pelo campo de "outra
 * quantidade". Decidido com produto em 06/10/2026; não está no Figma.
 */
export const QUANTIDADES_PADRAO = [1, 2, 3, 6, 10, 12, 24, 36, 48, 60, 72, 84]

interface SelecaoParcelasProps {
  /**
   * Opções de parcelamento retornadas por `POST /divida-ativa/parcelamentos/simular` para a
   * data já escolhida, com os valores já convertidos para número pelo DAL.
   */
  opcoes: SimulacaoOk['opcoes']
  /** Saldo devedor das CDAs escolhidas, como a simulação o devolve. Base do "Total". */
  valorTotalAvista: SimulacaoOk['valorTotalAvista']
  /** Parâmetros correntes da URL, para mantê-los na navegação de retorno. */
  searchParamsAtual: Record<string, string>
}

/**
 * Total pago na opção escolhida: saldo à vista mais os juros daquela quantidade de parcelas.
 *
 * A API não devolve um total por opção — a soma é do front, sobre dois números da própria
 * simulação, e foi a forma escolhida com produto em 06/10/2026. ⚠️ Na opção 1x ela pode
 * diferir em centavos do "Valor à vista" do item, porque `valorTotalAvista` e
 * `valor1aParcela` saem de arredondamentos diferentes do DAM. Quando a API passar a mandar
 * o total por opção, ele substitui esta conta.
 */
function calcularTotal(
  valorTotalAvista: number | null,
  valorJuros: number | null
): number | null {
  if (valorTotalAvista === null) return null

  return valorTotalAvista + (valorJuros ?? 0)
}

/** Rótulos e valores de uma opção — o miolo comum aos cards da lista e ao de outra quantidade. */
function ValoresOpcao({ opcao }: { opcao: OpcaoParcela | null }) {
  const aVista = opcao?.qtdeParcelas === 1
  // Desconto em reais absolutos (decisão D4). O Figma não tem a linha; ela só aparece
  // quando o DAM concede algum, para o cidadão não perder a informação.
  const desconto =
    opcao?.valorDescontos && opcao.valorDescontos > 0
      ? formatarValorBRL(opcao.valorDescontos)
      : null

  return (
    <span className="flex min-w-0 flex-1 items-start justify-between gap-2">
      <span className="flex flex-col">
        <span className="text-sm font-normal leading-5 text-foreground">
          {aVista ? 'Valor à vista' : 'Valor da 1ª parcela'}
        </span>
        <span className="text-xs font-normal leading-4 text-foreground-light">
          Juros totais
        </span>
        {desconto && (
          <span className="text-xs font-normal leading-4 text-foreground-light">
            Desconto
          </span>
        )}
      </span>

      <span className="flex flex-col items-end text-right">
        <span className="text-sm font-medium leading-5 text-foreground">
          {formatarValorBRL(opcao?.valor1aParcela ?? null) ?? '—'}
        </span>
        <span className="text-xs font-normal leading-4 text-foreground-light">
          {formatarValorBRL(opcao?.valorJuros ?? null) ?? '—'}
        </span>
        {desconto && (
          <span className="text-xs font-normal leading-4 text-foreground-light">
            {desconto}
          </span>
        )}
      </span>
    </span>
  )
}

/** Indicador visual do radio; o `input` de verdade fica `sr-only` ao lado. */
function IndicadorRadio({ selecionado }: { selecionado: boolean }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
        selecionado
          ? 'border-primary bg-primary'
          : 'border-foreground-light bg-transparent'
      }`}
      aria-hidden
    >
      {selecionado && (
        <span className="size-2 rounded-full bg-primary-foreground" />
      )}
    </span>
  )
}

function classesCard(selecionado: boolean) {
  return `flex cursor-pointer items-center gap-3 rounded-2xl p-4 transition-colors ${
    selecionado
      ? 'bg-primary/10 ring-2 ring-primary'
      : 'bg-card hover:bg-secondary'
  }`
}

/**
 * Seleção de quantas parcelas o cidadão quer pagar — etapa 2 da simulação, depois da data.
 *
 * A lista mostra só `QUANTIDADES_PADRAO`; qualquer outra quantidade oferecida pelo DAM é
 * digitada no último card, que tem o mesmo formato dos demais com um campo no lugar do
 * "Nx". Todas as opções já vêm na mesma resposta da simulação, então digitar não chama a
 * API: os valores aparecem assim que o número bate com uma opção.
 *
 * O rodapé fica fixo com o total da opção escolhida e o "Continuar", como no Figma.
 *
 * O número de parcelas escolhido vai como `?parcelas=N` na URL do requerimento, junto da
 * `?data=` já escolhida — ele preenche `qtdeParcelas` no corpo do requerimento, e o
 * cidadão que compartilha o link reencontra a mesma escolha, inclusive uma digitada.
 *
 * Client Component: a interatividade do radio e do campo não roda no servidor.
 */
export function SelecaoParcelas({
  opcoes,
  valorTotalAvista,
  searchParamsAtual,
}: SelecaoParcelasProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campoId = useId()
  const erroId = useId()

  const opcoesPadrao = opcoes.filter(opcao =>
    QUANTIDADES_PADRAO.includes(opcao.qtdeParcelas)
  )
  // O campo só existe se houver o que digitar além da lista.
  const temOutras = opcoesPadrao.length < opcoes.length
  const minimo = Math.min(...opcoes.map(opcao => opcao.qtdeParcelas))
  const maximo = Math.max(...opcoes.map(opcao => opcao.qtdeParcelas))

  const daUrl = Number(searchParams.get('parcelas')) || null
  const daUrlEhOutra =
    daUrl !== null && !QUANTIDADES_PADRAO.includes(daUrl) && temOutras

  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<
    number | null
  >(daUrl)
  // Separa "escolheu 12 na lista" de "digitou 12": só um dos dois cards fica marcado.
  const [outraSelecionada, setOutraSelecionada] = useState(daUrlEhOutra)
  const [digitado, setDigitado] = useState(daUrlEhOutra ? String(daUrl) : '')

  const numeroDigitado = digitado === '' ? null : Number(digitado)
  const opcaoDigitada =
    opcoes.find(opcao => opcao.qtdeParcelas === numeroDigitado) ?? null
  const erroDigitado =
    numeroDigitado === null || opcaoDigitada
      ? null
      : numeroDigitado < minimo || numeroDigitado > maximo
        ? `Escolha entre ${minimo} e ${maximo} parcelas.`
        : 'Esta quantidade de parcelas não está disponível.'

  const opcaoSelecionada =
    opcoes.find(opcao => opcao.qtdeParcelas === parcelasSelecionadas) ?? null

  // Sem escolha, o Figma mostra R$ 0,00 — o total ainda não existe.
  const total = opcaoSelecionada
    ? calcularTotal(valorTotalAvista, opcaoSelecionada.valorJuros)
    : 0

  function escolherDaLista(qtde: number) {
    setParcelasSelecionadas(qtde)
    setOutraSelecionada(false)
  }

  function digitar(valor: string) {
    const digitos = valor.replace(/\D/g, '').slice(0, String(maximo).length)
    setDigitado(digitos)

    const opcao =
      opcoes.find(item => item.qtdeParcelas === Number(digitos)) ?? null

    // Número válido seleciona na hora; inválido ou apagado desfaz só a escolha digitada,
    // nunca uma feita na lista.
    if (opcao && digitos !== '') {
      setParcelasSelecionadas(opcao.qtdeParcelas)
      setOutraSelecionada(true)
    } else if (outraSelecionada) {
      setParcelasSelecionadas(null)
      setOutraSelecionada(false)
    }
  }

  function continuar() {
    if (parcelasSelecionadas === null) return

    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('parcelas', String(parcelasSelecionadas))

    // Próxima etapa: requerimento, com ?data= e ?parcelas= para montar o corpo da API.
    router.push(`/divida-ativa/parcelamento/requerimento?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Selecione em quantas parcelas você deseja pagar
      </h1>

      <fieldset className="flex flex-col gap-2 px-4 pb-6">
        <legend className="sr-only">Número de parcelas</legend>

        {opcoesPadrao.map(opcao => {
          const selecionada =
            !outraSelecionada && parcelasSelecionadas === opcao.qtdeParcelas
          const inputId = `parcelas-${opcao.qtdeParcelas}`

          return (
            <label
              key={opcao.qtdeParcelas}
              htmlFor={inputId}
              className={classesCard(selecionada)}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-normal leading-5 text-foreground">
                {opcao.qtdeParcelas}x
              </span>

              <ValoresOpcao opcao={opcao} />

              <input
                type="radio"
                id={inputId}
                name="qtde-parcelas"
                value={opcao.qtdeParcelas}
                checked={selecionada}
                onChange={() => escolherDaLista(opcao.qtdeParcelas)}
                className="sr-only"
              />
              <IndicadorRadio selecionado={selecionada} />
            </label>
          )
        })}

        {temOutras && (
          <div className="flex flex-col gap-1">
            {/* Mesmo card dos demais, com o campo no lugar do "Nx". É um `label` do campo:
                tocar em qualquer ponto do card leva o foco para ele. */}
            <label htmlFor={campoId} className={classesCard(outraSelecionada)}>
              <span className="relative flex shrink-0 items-center">
                <Input
                  id={campoId}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Nº"
                  value={digitado}
                  onChange={event => digitar(event.target.value)}
                  aria-label={`Outra quantidade de parcelas, de ${minimo} a ${maximo}`}
                  aria-invalid={erroDigitado !== null}
                  aria-describedby={erroDigitado ? erroId : undefined}
                  className="h-10 w-14 rounded-full bg-secondary px-2 pr-5 text-center text-sm"
                />
                <span
                  className="pointer-events-none absolute right-2.5 text-sm text-foreground"
                  aria-hidden
                >
                  x
                </span>
              </span>

              <ValoresOpcao opcao={opcaoDigitada} />

              <IndicadorRadio selecionado={outraSelecionada} />
            </label>

            {erroDigitado && (
              <p
                id={erroId}
                role="alert"
                className="px-4 text-xs font-normal leading-4 text-destructive"
              >
                {erroDigitado}
              </p>
            )}
          </div>
        )}
      </fieldset>

      {/* Rodapé fixo: a lista rola por baixo dele. O `mt-auto` o leva ao fim da tela quando a
          lista é curta; o `pb-6` da lista garante o respiro quando ela é longa. */}
      <div className="sticky bottom-0 mt-auto flex items-center justify-between gap-4 border-t border-border bg-background p-4">
        <div className="flex flex-col" aria-live="polite">
          <span className="text-sm font-normal leading-5 text-foreground-light">
            Total
          </span>
          <span className="text-xl font-medium leading-7 text-foreground">
            {formatarValorBRL(total) ?? '—'}
          </span>
        </div>

        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          className="shrink-0 px-10"
          disabled={parcelasSelecionadas === null}
          onClick={continuar}
        >
          Continuar
        </CustomButton>
      </div>
    </div>
  )
}

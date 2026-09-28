'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import type { ParcelaOpcaoResponse } from '@/http-divida-ativa/models'
import { formatarValorBRL } from '@/lib/divida-ativa-utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface SelecaoParcelasProps {
  /**
   * Opções de parcelamento retornadas pelo endpoint `POST .../parcelamentos/simular`.
   *
   * Cada opção tem o número de parcelas e o valor da primeira parcela. Os descontos e juros
   * vêm separados (decisão D4: desconto em reais absolutos, não em percentual).
   */
  opcoes: ParcelaOpcaoResponse[]
  /** Parâmetros correntes da URL, para mantê-los na navegação de retorno. */
  searchParamsAtual: Record<string, string>
}

/**
 * Seleção de quantas parcelas o cidadão quer pagar (Figma, tela direita).
 *
 * Cada item da lista é uma opção de `qtdeParcelas` com o respectivo `valor1aParcela`.
 * Seleção única, como as datas: um número, um clique, "Continuar".
 *
 * O número de parcelas escolhido vai como `?parcelas=N` na URL — a próxima tela
 * (requerimento) o usa para preencher `ParcelamentoSimularRequest.qtdeParcelas` no
 * corpo do requerimento, e o cidadão que compartilha o link reencontra a mesma escolha.
 *
 * Client Component: a interatividade do radio não roda no servidor.
 */
export function SelecaoParcelas({
  opcoes,
  searchParamsAtual,
}: SelecaoParcelasProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<
    number | null
  >(() => {
    const daUrl = searchParams.get('parcelas')
    return daUrl ? Number(daUrl) : null
  })

  function continuar() {
    if (parcelasSelecionadas === null) return

    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('parcelas', String(parcelasSelecionadas))

    // Próxima etapa: seleção da data de vencimento, na mesma rota com ?parcelas=N.
    router.push(`/divida-ativa/parcelamento/simulacao?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Selecione em quantas parcelas você deseja pagar
      </h1>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Número de parcelas</legend>

        {opcoes.map(opcao => {
          if (opcao.qtdeParcelas === undefined) return null

          const selecionada = parcelasSelecionadas === opcao.qtdeParcelas
          const inputId = `parcelas-${opcao.qtdeParcelas}`

          // Valor da primeira parcela — string da API, passada por `formatarValorBRL` só
          // depois de converter. A API devolve string; o formatter espera number | null.
          const valorFormatado = opcao.valor1aParcela
            ? formatarValorBRL(
                Number.parseFloat(
                  // Normaliza separador decimal: "1.234,56" e "1234.56" → "1234.56"
                  opcao.valor1aParcela
                    .replace(/\./g, '')
                    .replace(',', '.')
                )
              )
            : null

          const valorDescontos = opcao.valorDescontos
            ? formatarValorBRL(
                Number.parseFloat(
                  opcao.valorDescontos.replace(/\./g, '').replace(',', '.')
                )
              )
            : null

          return (
            <label
              key={opcao.qtdeParcelas}
              htmlFor={inputId}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4 transition-colors ${
                selecionada
                  ? 'bg-primary/10 ring-2 ring-primary'
                  : 'bg-card hover:bg-secondary'
              }`}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium leading-5 text-foreground">
                  {opcao.qtdeParcelas}x
                  {valorFormatado ? ` de ${valorFormatado}` : ''}
                </span>

                {valorDescontos && (
                  <span className="text-xs font-normal leading-4 text-foreground-light">
                    Desconto: {valorDescontos}
                  </span>
                )}
              </div>

              <input
                type="radio"
                id={inputId}
                name="qtde-parcelas"
                value={opcao.qtdeParcelas}
                checked={selecionada}
                onChange={() => setParcelasSelecionadas(opcao.qtdeParcelas!)}
                className="sr-only"
              />

              {/* Indicador visual do radio */}
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selecionada
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground bg-transparent'
                }`}
                aria-hidden
              >
                {selecionada && (
                  <span className="size-2 rounded-full bg-primary-foreground" />
                )}
              </span>
            </label>
          )
        })}
      </fieldset>

      <CustomButton
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        className="mt-auto"
        disabled={parcelasSelecionadas === null}
        onClick={continuar}
      >
        Continuar
      </CustomButton>
    </div>
  )
}

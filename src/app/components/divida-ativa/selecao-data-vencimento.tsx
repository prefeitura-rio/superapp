'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface SelecaoDataVencimentoProps {
  /**
   * Datas disponíveis, no formato `dd/MM/yyyy` que a API devolve.
   *
   * A API devolve strings, não objetos Date, para que a leitura seja sem ambiguidade de
   * fuso horário. O front exibe e trafega a data exatamente como veio, sem transformar —
   * é o mesmo valor que vai em `ParcelamentoSimularRequest.dataVencimento`.
   */
  datas: string[]
  /** Parâmetros correntes da URL — critério da consulta, CDAs — que seguem para a próxima etapa. */
  searchParamsAtual: Record<string, string>
}

/**
 * Seleção da data de vencimento da primeira parcela — etapa 1 da simulação.
 *
 * Vem antes das parcelas porque o DAM calcula as opções a partir da data. A escolhida vai
 * como `?data=` para a etapa 2, na mesma rota, onde alimenta
 * `ParcelamentoSimularRequest.dataVencimento`.
 *
 * O estado da URL é compartilhável: cidadão que compartilha o link reencontra a mesma
 * seleção. O botão Voltar devolve esta tela com a data já marcada.
 *
 * Client Component porque `radio` precisa de `onChange`.
 */
export function SelecaoDataVencimento({
  datas,
  searchParamsAtual,
}: SelecaoDataVencimentoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Lê da URL se o cidadão voltou desta tela: a data que ele já tinha escolhido reaparece.
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    () => searchParams.get('data') ?? ''
  )

  function continuar() {
    if (!dataSelecionada) return

    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('data', dataSelecionada)

    // Próxima etapa: quantidade de parcelas, na mesma rota com ?data=.
    router.push(`/divida-ativa/parcelamento/simulacao?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Selecione a data de vencimento do boleto
      </h1>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">
          Data de vencimento da primeira parcela
        </legend>

        {datas.map(data => {
          const selecionada = dataSelecionada === data
          const inputId = `data-${data}`

          return (
            <label
              key={data}
              htmlFor={inputId}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4 transition-colors ${
                selecionada
                  ? 'bg-primary/10 ring-2 ring-primary'
                  : 'bg-card hover:bg-secondary'
              }`}
            >
              <span className="text-sm font-normal leading-5 text-foreground">
                {data}
              </span>

              {/* Radio nativo, visualmente escondido — o card inteiro é o controle. */}
              <input
                type="radio"
                id={inputId}
                name="data-vencimento"
                value={data}
                checked={selecionada}
                onChange={() => setDataSelecionada(data)}
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

      <div className="mt-auto pt-6">
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!dataSelecionada}
          onClick={continuar}
        >
          Continuar
        </CustomButton>
      </div>
    </div>
  )
}

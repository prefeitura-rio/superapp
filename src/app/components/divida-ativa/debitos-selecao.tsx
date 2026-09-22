'use client'

import { DebitoCard } from '@/app/components/divida-ativa/debito-card'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

/** Onde a seleção viaja na URL, aqui e na tela seguinte. */
const PARAM_CDAS = 'cdas'

interface DebitosSelecaoProps {
  cdas: DebitoDividaAtiva[]
}

/**
 * Seleção das CDAs que entram no parcelamento.
 *
 * **Só por CDA** (decisão D5): `ParcelamentoSimularRequest` recebe uma lista de `cdas` e
 * nada mais, então não há o que selecionar em separado para principal e honorários — eles
 * andam juntos na certidão, mesmo sendo exibidos apartados.
 *
 * ### Por que a seleção não vai para a URL a cada clique
 *
 * A convenção do projeto manda estado de UI compartilhável para query params, e ela vale
 * aqui — mas com uma ressalva que o custo desta tela impõe. A consulta que a alimenta
 * atravessa o ePortal e leva ~16 s; no App Router não há navegação rasa, então um
 * `router.replace` por checkbox marcado refaria a chamada inteira e o cidadão veria a lista
 * sumir no meio da escolha.
 *
 * O meio-termo: a seleção é **lida** da URL na montagem e **escrita** nela no "Continuar".
 * Quem volta da simulação reencontra o que marcou, o endereço continua compartilhável, e
 * nenhum clique custa 16 s.
 */
export function DebitosSelecao({ cdas }: DebitosSelecaoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selecionadas, setSelecionadas] = useState<Set<string>>(() => {
    const daUrl = searchParams.get(PARAM_CDAS)?.split(',').filter(Boolean) ?? []

    // Só o que existe nesta lista: uma CDA herdada de um link velho, que a consulta atual
    // não devolveu, viraria seleção fantasma — marcada em nenhum card e mandada à simulação.
    const existentes = new Set(
      cdas.filter(cda => cda.parcelavel).map(cda => cda.numeroCda)
    )

    return new Set(daUrl.filter(numero => existentes.has(numero)))
  })

  function alternar(numeroCda: string) {
    setSelecionadas(atual => {
      const proxima = new Set(atual)

      if (proxima.has(numeroCda)) {
        proxima.delete(numeroCda)
      } else {
        proxima.add(numeroCda)
      }

      return proxima
    })
  }

  function continuar() {
    // A ordem vem da lista, não da ordem dos cliques: a URL de duas seleções iguais tem de
    // ser a mesma string, senão dois cidadãos com a mesma escolha geram endereços diferentes.
    const escolhidas = cdas
      .filter(cda => selecionadas.has(cda.numeroCda))
      .map(cda => cda.numeroCda)

    // O critério da consulta (`inscricao`, `cda` ou `execucaoFiscal`) segue junto: a tela de
    // simulação precisa dele para chamar a API, e reconstruí-lo lá seria adivinhação.
    const destino = new URLSearchParams(searchParams)
    destino.set(PARAM_CDAS, escolhidas.join(','))

    router.push(`/divida-ativa/parcelamento/simulacao?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Selecione os débitos que deseja pagar
      </h1>

      <ul className="flex flex-col gap-2">
        {cdas.map(cda => (
          <li key={cda.numeroCda}>
            <DebitoCard
              debito={cda}
              selecionado={selecionadas.has(cda.numeroCda)}
              onToggle={alternar}
            />
          </li>
        ))}
      </ul>

      <CustomButton
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        className="mt-auto"
        disabled={selecionadas.size === 0}
        onClick={continuar}
      >
        Continuar
      </CustomButton>
    </div>
  )
}

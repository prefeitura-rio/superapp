'use client'

import { emitirGuiaAvista } from '@/actions/divida-ativa/emitir-guia-avista'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  formatarValorBRL,
  rotuloNatureza,
  urlPdfDaPrefeitura,
} from '@/lib/divida-ativa-utils'
import type { ResultadoRevisaoPagamento } from '@/types/divida-ativa'
import { BuildingIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

type RevisaoOk = Extract<ResultadoRevisaoPagamento, { situacao: 'ok' }>

const ERRO_LINK_GUIA =
  'A guia foi emitida, mas não conseguimos abrir o PDF. Você pode obtê-la pela segunda via de guia.'

/**
 * Uma linha rótulo/valor, com o valor logo depois do rótulo, como no Figma.
 *
 * Some inteira quando não há valor — a mesma regra das linhas de `DebitoCard`. Um desconto
 * zero **aparece** ("R$0,00"): zero é resposta do DAM, `null` é que é ausência.
 */
function Linha({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  if (!valor) return null

  return (
    <div className="flex flex-wrap items-baseline gap-x-1">
      <dt className="text-sm font-normal leading-5 text-foreground-light">
        {rotulo}
      </dt>
      <dd className="text-sm font-normal leading-5 text-foreground">{valor}</dd>
    </div>
  )
}

interface RevisaoPagamentoProps {
  revisao: RevisaoOk
  /** CDAs da seleção, como vieram em `?cdas=` — as mesmas que a revisão simulou. */
  cdas: string[]
  /** Etapa seguinte — a simulação, que começa pela data de vencimento. */
  rotaContinuar: string
}

/**
 * "Revise as informações de pagamento" — entre a seleção de débitos e a simulação.
 *
 * Os valores são da simulação à vista (`POST /divida-ativa/avista/simular`): saldos,
 * descontos e honorários por CDA, os totais e a GRERJ por execução fiscal. Descontos e GRERJ
 * só existem depois de uma simulação — a consulta de débitos não os tem.
 *
 * **Principal e honorários seguem separados** (decisão D5), e os totais são os da API.
 *
 * ### "Imprimir Guia a Vista"
 *
 * Como no portal legado: emite a guia à vista e abre o PDF dela, servido pelo DAM Internet.
 * A emissão usa a `dataVencimento` da revisão, para a guia ter os valores desta tela.
 *
 * São dois passos: o botão emite nesta tela e, com a guia pronta, vira o link "Abrir guia
 * (PDF)". Abrir o PDF direto depois do `await` não funciona — a emissão leva de 10 a 15 s, o
 * clique deixa de valer como gesto do cidadão e o bloqueador de pop-up barra a aba; abrir uma
 * aba vazia no clique e preenchê-la depois deixava uma aba em branco presa quando algo falhava.
 * O link é um clique de verdade: abre em qualquer navegador e não emite outra guia.
 *
 * Cada emissão cria uma guia no DAM, então o botão fica travado enquanto emite.
 *
 * ⚠️ Ícone Lucide (`BuildingIcon`) como fallback — o design system não tem o ícone de imóvel
 * que o Figma usa. Ver a descrição da PR.
 */
export function RevisaoPagamento({
  revisao,
  cdas,
  rotaContinuar,
}: RevisaoPagamentoProps) {
  const [emitindo, startTransition] = useTransition()

  // Depois de emitida, a guia não é emitida de novo: o botão vira o link do PDF.
  const [urlGuia, setUrlGuia] = useState<string | null>(null)

  function imprimirGuia() {
    startTransition(async () => {
      const resultado = await emitirGuiaAvista(cdas, revisao.dataVencimento)

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      // A action já filtra o host; repetir aqui garante que nada de fora chega ao `href`.
      const urlPdf = urlPdfDaPrefeitura(resultado.data.urlPdf)
      if (!urlPdf) {
        toast.error(ERRO_LINK_GUIA)
        return
      }

      setUrlGuia(urlPdf)
    })
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Revise as informações de pagamento
      </h1>

      <section
        aria-label="Resumo do pagamento"
        className="flex flex-col gap-2 rounded-2xl bg-card p-4"
      >
        <div className="flex flex-col pb-2">
          <span className="text-2xl font-medium leading-8 text-foreground">
            {/* Total a pagar (principal + honorários + GRERJ − descontos), como o DAM o
                calcula — não só o principal, que já aparece em cada CDA. */}
            {formatarValorBRL(revisao.valorTotal) ?? '—'}
          </span>
          <span className="text-sm font-normal leading-5 text-foreground-light">
            Saldo principal total
          </span>
        </div>

        <dl className="flex flex-col pb-4">
          <Linha
            rotulo="Desconto principal total"
            valor={formatarValorBRL(revisao.descontoPrincipalTotal)}
          />
          <Linha
            rotulo="Honorários total"
            valor={formatarValorBRL(revisao.honorariosTotal)}
          />
          <Linha
            rotulo="Desconto honorários total"
            valor={formatarValorBRL(revisao.descontoHonorariosTotal)}
          />
        </dl>

        <ul className="flex flex-col gap-2">
          {revisao.itens.map(item => (
            <li
              key={item.numeroCda}
              className="flex flex-col gap-4 rounded-2xl bg-background p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <BuildingIcon
                    className="size-5 text-foreground"
                    aria-hidden
                  />
                </span>
                <h2 className="text-base font-normal leading-6 text-foreground">
                  {rotuloNatureza(item.natureza) ?? 'Certidão de Dívida Ativa'}
                </h2>
              </div>

              <dl className="flex flex-col">
                <Linha rotulo="Certidões" valor={item.numeroCda} />
                <Linha rotulo="Contribuinte" valor={item.contribuinte} />
                {/* Título curto ("IPTU") em cima, descrição inteira aqui, como no Figma. */}
                <Linha rotulo="Natureza da dívida" valor={item.natureza} />
                <Linha
                  rotulo="Saldo principal"
                  valor={formatarValorBRL(item.saldoPrincipal)}
                />
                <Linha
                  rotulo="Desconto principal"
                  valor={formatarValorBRL(item.descontoPrincipal)}
                />
                <Linha
                  rotulo="Honorários"
                  valor={formatarValorBRL(item.honorarios)}
                />
                <Linha
                  rotulo="Desconto honorários"
                  valor={formatarValorBRL(item.descontoHonorarios)}
                />
              </dl>
            </li>
          ))}
        </ul>

        {/* Só há GRERJ quando alguma CDA está em execução fiscal. Sem custas, sem card. */}
        {revisao.grerjs.length > 0 && (
          <div className="flex flex-col gap-4 rounded-2xl bg-background p-4">
            <h2 className="text-base font-normal leading-6 text-foreground">
              Lista de GRERJ
            </h2>

            <ul className="flex flex-col gap-3">
              {revisao.grerjs.map(grerj => (
                <li key={grerj.execucaoFiscal}>
                  <dl className="flex flex-col">
                    <Linha
                      rotulo="Execução fiscal"
                      valor={grerj.execucaoFiscal}
                    />
                    <Linha
                      rotulo="Valor"
                      valor={formatarValorBRL(grerj.valor)}
                    />
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* `mt-auto` sozinho zera quando o conteúdo passa da altura da tela; o `pt-6` garante o
          respiro mínimo entre o resumo e os botões. */}
      <div className="mt-auto flex flex-col gap-2 pt-6">
        {urlGuia ? (
          <CustomButton asChild variant="card" size="lg" fullWidth>
            <a href={urlGuia} target="_blank" rel="noopener noreferrer">
              Abrir guia (PDF)
            </a>
          </CustomButton>
        ) : (
          <CustomButton
            type="button"
            variant="card"
            size="lg"
            fullWidth
            loading={emitindo}
            onClick={imprimirGuia}
          >
            Imprimir Guia a Vista
          </CustomButton>
        )}

        <CustomButton asChild variant="primary" size="lg" fullWidth>
          <Link href={rotaContinuar}>Requerer parcelamento</Link>
        </CustomButton>
      </div>
    </div>
  )
}

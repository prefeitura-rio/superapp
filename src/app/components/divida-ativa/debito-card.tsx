'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { formatarValorBRL } from '@/lib/divida-ativa-utils'
import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import { FileTextIcon } from 'lucide-react'
import { useState } from 'react'
import { DebitoDetalhesDrawer } from './debito-detalhes-drawer'

/**
 * Uma linha rótulo/valor do card.
 *
 * Some inteira quando não há valor: linha vazia é pior que linha ausente — a mesma regra que
 * `ImovelResumoCard` segue. Aqui ela importa mais, porque os valores monetários nunca foram
 * vistos preenchidos em homologação (premissa P1) e `null` é o caso provável.
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

interface DebitoCardProps {
  debito: DebitoDividaAtiva
  selecionado: boolean
  onToggle: (numeroCda: string) => void
}

/**
 * Card de uma CDA na tela de seleção de débitos.
 *
 * O que fica visível é o que o Figma mostra — certidão, ano, natureza e valor. O resto do
 * que a API devolve (honorários, contribuinte, inscrição, fase de cobrança, as duas situações
 * e o protocolo aberto) vive no drawer do "Ver mais" (`DebitoDetalhesDrawer`): é informação
 * de quem foi conferir, e o Figma a tira do card para a lista não crescer.
 *
 * **Principal e honorários nunca são somados** (decisão D5). O card mostra o principal como
 * "Valor" e os honorários como linha própria no drawer; um total agregado não existe no
 * contrato (premissa P13) e inventá-lo no front seria afirmar um número que a API não
 * confirma.
 *
 * ⚠️ Ícone Lucide (`FileTextIcon`) como fallback — o design system não tem o ícone de
 * certidão que o Figma usa. Ver a descrição da PR.
 */
export function DebitoCard({ debito, selecionado, onToggle }: DebitoCardProps) {
  const [detalhesAbertos, setDetalhesAbertos] = useState(false)

  const valorPrincipal = formatarValorBRL(debito.valorPrincipal)

  return (
    <article className="rounded-2xl bg-card p-4">
      <div className="flex items-start gap-4">
        {/* `min-w-0` deixa o número da certidão quebrar linha em vez de esticar o card e
            empurrar o checkbox para fora. */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <FileTextIcon className="size-4 text-foreground" aria-hidden />
            </span>
            {debito.natureza && (
              <h2 className="text-base font-medium leading-6 text-foreground">
                {debito.natureza}
              </h2>
            )}
          </div>

          <dl className="flex flex-col gap-1">
            <Linha
              rotulo="Certidão de Dívida Ativa"
              valor={debito.numeroCda || null}
            />
            <Linha
              rotulo="Ano"
              valor={
                debito.exercicio === null ? null : String(debito.exercicio)
              }
            />
            {/* `receita` traz a descrição longa que o Figma mostra ("IPTU/Taxas - Predial");
                `natureza` é o fallback curto quando ela não vem. */}
            <Linha
              rotulo="Natureza da dívida"
              valor={debito.receita ?? debito.natureza}
            />
            <Linha rotulo="Valor" valor={valorPrincipal} />
          </dl>

          <button
            type="button"
            onClick={() => setDetalhesAbertos(true)}
            aria-haspopup="dialog"
            className="self-start text-sm font-normal leading-5 text-foreground underline-offset-2 hover:underline"
          >
            Ver mais
          </button>
        </div>

        <Checkbox
          className="self-center"
          checked={selecionado}
          disabled={!debito.parcelavel}
          onCheckedChange={() => onToggle(debito.numeroCda)}
          aria-label={`Selecionar certidão ${debito.numeroCda}`}
        />
      </div>

      {/* A API decide a elegibilidade (`selecionavelParcelamento`); o front só explica o
          checkbox apagado, sem inventar o motivo. */}
      {!debito.parcelavel && (
        <p className="pt-3 text-sm font-normal leading-5 text-foreground-light">
          Esta certidão não está disponível para parcelamento.
        </p>
      )}

      <DebitoDetalhesDrawer
        debito={debito}
        open={detalhesAbertos}
        onOpenChange={setDetalhesAbertos}
      />
    </article>
  )
}

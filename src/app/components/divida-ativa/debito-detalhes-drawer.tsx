'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import {
  formatarInscricaoImobiliaria,
  formatarValorBRL,
} from '@/lib/divida-ativa-utils'
import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import Link from 'next/link'

/**
 * Uma linha do drawer: rótulo em cima, valor embaixo, como no Figma.
 *
 * Some inteira quando não há valor — a mesma regra das linhas do card.
 */
function Item({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  if (!valor) return null

  return (
    <div className="flex flex-col">
      <dt className="text-sm font-normal leading-5 text-foreground-light">
        {rotulo}
      </dt>
      <dd className="text-sm font-normal leading-5 text-foreground">{valor}</dd>
    </div>
  )
}

interface DebitoDetalhesDrawerProps {
  debito: DebitoDividaAtiva
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Detalhes de uma CDA, aberto pelo "Ver mais" do card.
 *
 * O Figma pede um bottom sheet em vez da expansão do card: com várias CDAs, expandir uma
 * empurrava as outras e o "Continuar" para longe.
 *
 * **Honorários aparecem em linha própria**, logo depois do valor do principal, embora o
 * Figma não os mostre. É dinheiro que o cidadão deve, e a decisão D5 manda exibi-lo separado
 * do principal — sem esta linha ele não aparece em lugar nenhum da tela.
 */
export function DebitoDetalhesDrawer({
  debito,
  open,
  onOpenChange,
}: DebitoDetalhesDrawerProps) {
  const titulo = debito.natureza ?? 'Certidão de Dívida Ativa'

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={titulo}>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-medium leading-7 text-foreground">
          {titulo}
        </h2>

        <dl className="flex flex-col gap-4">
          <Item
            rotulo="Certidão de Dívida Ativa"
            valor={debito.numeroCda || null}
          />
          <Item
            rotulo="Ano"
            valor={debito.exercicio === null ? null : String(debito.exercicio)}
          />
          <Item
            rotulo="Natureza da dívida"
            valor={debito.receita ?? debito.natureza}
          />
          <Item
            rotulo="Valor"
            valor={formatarValorBRL(debito.valorPrincipal)}
          />
          <Item
            rotulo="Honorários"
            valor={formatarValorBRL(debito.valorHonorarios)}
          />
          <Item rotulo="Contribuinte" valor={debito.contribuinte} />
          <Item
            rotulo="Inscrição imobiliária"
            valor={
              debito.inscricao
                ? formatarInscricaoImobiliaria(debito.inscricao)
                : null
            }
          />
          {/* Situações e fase vêm como texto livre do DAM. Exibidas como vieram: traduzir
              aqui seria reimplementar uma classificação que é da API. */}
          <Item
            rotulo="Situação do principal"
            valor={debito.situacaoPrincipal}
          />
          <Item rotulo="Fase da cobrança" valor={debito.faseCobranca} />
          <Item
            rotulo="Situação dos honorários"
            valor={debito.situacaoHonorarios}
          />
        </dl>

        {debito.protocoloRequerimentoAberto && (
          /* Decisão D9: protocolo aberto informa e dá caminho — nunca bloqueia. Quem diz
             se pode parcelar é `parcelavel`, e os dois não se derivam um do outro. */
          <p className="text-sm font-normal leading-5 text-foreground-light">
            Já existe um requerimento em andamento para esta certidão, protocolo{' '}
            {debito.protocoloRequerimentoAberto}.{' '}
            <Link
              href="/divida-ativa/acompanhamento"
              className="underline underline-offset-2 text-foreground"
            >
              Acompanhar requerimento
            </Link>
          </p>
        )}
      </div>
    </BottomSheet>
  )
}

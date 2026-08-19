'use client'

import { adicionarImovel } from '@/actions/divida-ativa/adicionar-imovel'
import { ImovelResumoCard } from '@/app/components/divida-ativa/imovel-resumo-card'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

interface ConfirmarImovelProps {
  /** Resultado da consulta ao sistema fiscal. Ainda **não** está cadastrado. */
  imovel: ImovelDividaAtiva
  /** Nome dado pelo cidadão no passo anterior; segue até a action (premissa P23). */
  nome?: string
  /** Destino do "Voltar" — o passo do nome, preservando o que já foi digitado. */
  voltarHref: string
}

/**
 * Último passo antes de gravar. A consulta que trouxe estes dados não cadastrou nada — quem
 * cadastra é o "Confirmar" daqui.
 */
export function ConfirmarImovel({
  imovel,
  nome,
  voltarHref,
}: ConfirmarImovelProps) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      const resultado = await adicionarImovel(imovel.inscricao, nome)

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      router.push('/divida-ativa/imoveis/novo/sucesso')
    })
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Confirme sua inscrição imobiliária
      </h1>

      {/* O mesmo card da lista de "Meus imóveis": o cidadão confirma vendo exatamente o
          que vai encontrar lá depois. O nome vem do passo anterior, não da consulta. */}
      <ImovelResumoCard imovel={imovel} nome={nome} />

      <div className="mt-auto flex gap-3 pt-8">
        <CustomButton
          asChild
          variant="secondary"
          size="lg"
          className="flex-1"
          disabled={enviando}
        >
          <Link href={voltarHref}>Voltar</Link>
        </CustomButton>

        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={enviando}
          onClick={confirmar}
        >
          Confirmar
        </CustomButton>
      </div>
    </div>
  )
}

'use client'

import { adicionarImovel } from '@/actions/divida-ativa/adicionar-imovel'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { formatarInscricaoImobiliaria } from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

interface ConfirmarImovelProps {
  /** Resultado da consulta ao sistema fiscal. Ainda **não** está cadastrado. */
  imovel: ImovelDividaAtiva
}

/**
 * Último passo antes de gravar. A consulta que trouxe estes dados não cadastrou nada — quem
 * cadastra é o "Confirmar" daqui.
 */
export function ConfirmarImovel({ imovel }: ConfirmarImovelProps) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      const resultado = await adicionarImovel(imovel.inscricao)

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

      <article className="flex flex-col gap-4 rounded-2xl bg-card p-4">
        <div>
          {imovel.endereco && (
            <p className="text-base font-normal leading-6 text-foreground">
              {imovel.endereco}
            </p>
          )}
          {imovel.bairro && (
            <p className="text-sm font-normal leading-5 text-foreground-light">
              {imovel.bairro}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-normal leading-5 text-foreground-light">
            Inscrição imobiliária
          </p>
          <p className="text-sm font-normal leading-5 text-foreground">
            {formatarInscricaoImobiliaria(imovel.inscricao)}
          </p>
        </div>

        {imovel.proprietario && (
          <div>
            <p className="text-sm font-normal leading-5 text-foreground-light">
              Proprietário
            </p>
            <p className="text-sm font-normal leading-5 text-foreground">
              {imovel.proprietario}
            </p>
          </div>
        )}
      </article>

      <div className="mt-auto flex gap-3 pt-8">
        <CustomButton
          asChild
          variant="secondary"
          size="lg"
          className="flex-1"
          disabled={enviando}
        >
          <Link href="/divida-ativa/imoveis/novo">Voltar</Link>
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

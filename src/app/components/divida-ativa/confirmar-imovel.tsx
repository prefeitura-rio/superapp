import { ImovelResumoCard } from '@/app/components/divida-ativa/imovel-resumo-card'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import Link from 'next/link'

interface ConfirmarImovelProps {
  /** Resultado da consulta ao sistema fiscal. Ainda **não** está cadastrado. */
  imovel: ImovelDividaAtiva
  /** Próximo passo do fluxo: a escolha do nome, que é quem grava. */
  continuarHref: string
}

/**
 * O cidadão confere o que a consulta trouxe e segue para o passo do nome. Nada é gravado
 * aqui: a gravação acontece no "Continuar" do passo do nome, o último antes do sucesso.
 */
export function ConfirmarImovel({
  imovel,
  continuarHref,
}: ConfirmarImovelProps) {
  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Confirme sua inscrição imobiliária
      </h1>

      {/* O mesmo card da lista de "Meus imóveis": o cidadão confirma vendo exatamente o
          que vai encontrar lá depois. */}
      <ImovelResumoCard imovel={imovel} />

      <CustomButton
        asChild
        variant="primary"
        size="lg"
        fullWidth
        className="mt-auto"
      >
        <Link href={continuarHref}>Continuar</Link>
      </CustomButton>
    </div>
  )
}

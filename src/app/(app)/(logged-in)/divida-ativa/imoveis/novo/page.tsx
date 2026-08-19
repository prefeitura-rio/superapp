import { InscricaoImobiliariaForm } from '@/app/components/divida-ativa/inscricao-imobiliaria-form'
import { SecondaryHeader } from '@/app/components/secondary-header'

/**
 * Primeiro passo do cadastro: o cidadão digita a inscrição imobiliária.
 *
 * Nada é gravado aqui nem no passo seguinte — o formulário só leva o número para a tela de
 * confirmação, que consulta o sistema fiscal. A gravação acontece no "Confirmar" de lá.
 */
export default function NovoImovelPage() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/imoveis"
      />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Digite o número da inscrição imobiliária
      </h1>

      <InscricaoImobiliariaForm />
    </div>
  )
}

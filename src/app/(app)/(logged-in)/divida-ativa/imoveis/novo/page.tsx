import { InscricaoImobiliariaForm } from '@/app/components/divida-ativa/inscricao-imobiliaria-form'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'

/**
 * Primeiro passo do cadastro: o cidadão digita a inscrição imobiliária.
 *
 * Nada é gravado aqui nem no passo seguinte — o formulário só leva o número para a tela de
 * confirmação, que consulta o sistema fiscal. A gravação acontece no fim do fluxo, no
 * "Continuar" do passo do nome.
 */
export default function NovoImovelPage() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pb-4 text-foreground">
      <ProfileHeaderWrapper />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Digite o número da inscrição imobiliária
      </h1>

      <InscricaoImobiliariaForm />
    </div>
  )
}

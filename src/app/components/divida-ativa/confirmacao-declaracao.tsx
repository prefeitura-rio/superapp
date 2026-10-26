'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { formatarCpf } from '@/lib/divida-ativa-utils'
import { useId, useState } from 'react'

/** Texto da declaração — o mesmo do portal legado e da `poc_Imoveis`. */
export const TEXTO_DECLARACAO =
  'Declaro, sob as penas da lei, que os documentos anexados e informações apresentadas são autênticos e conferem com os originais.'

interface ConfirmacaoDeclaracaoFormProps {
  nome: string
  cpf: string
  /**
   * Envia o requerimento. Devolve a mensagem de erro para exibir aqui, ou `null` quando deu
   * certo (quem chama segue para a tela de sucesso).
   */
  onConfirmar: () => Promise<string | null>
}

/**
 * Declaração de autenticidade — o passo final do requerimento de parcelamento.
 *
 * O cidadão marca "li e concordo" e envia. **Não há reautenticação por senha**: a decisão de
 * 20/10/2026 tirou o campo de senha da conta Identidade Carioca que o portal legado pedia
 * (`reautenticar.jsp`) — o cidadão já está autenticado pelo Keycloak, e pedir a senha de novo
 * num formulário nosso não faz sentido. A questão foi levada aos donos do negócio; se voltar,
 * o caminho é step-up no Keycloak, não um campo de senha aqui (ver `docs/divida-ativa.md`).
 */
export function ConfirmacaoDeclaracaoForm({
  nome,
  cpf,
  onConfirmar,
}: ConfirmacaoDeclaracaoFormProps) {
  const idDeclaracao = useId()
  const [declaracaoAceita, setDeclaracaoAceita] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function confirmarEEnviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enviando || !declaracaoAceita) return

    setErro(null)
    setEnviando(true)
    try {
      setErro(await onConfirmar())
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form
      onSubmit={confirmarEEnviar}
      className="flex flex-col gap-4"
      noValidate
    >
      <h2 className="text-2xl font-medium leading-8 text-foreground">
        Declaração e confirmação
      </h2>

      <label
        htmlFor={idDeclaracao}
        className="flex cursor-pointer items-start gap-3 rounded-2xl bg-card p-4"
      >
        <Checkbox
          id={idDeclaracao}
          checked={declaracaoAceita}
          onCheckedChange={marcado => {
            setDeclaracaoAceita(marcado === true)
            if (erro) setErro(null)
          }}
          className="mt-0.5"
        />
        <span className="text-sm font-normal leading-5 text-foreground">
          {TEXTO_DECLARACAO}
        </span>
      </label>

      <p className="text-sm font-medium leading-5 text-foreground">
        {nome} · CPF {formatarCpf(cpf)}
      </p>

      {erro && (
        <p
          role="alert"
          className="text-sm font-normal leading-5 text-destructive"
        >
          {erro}
        </p>
      )}

      <CustomButton
        type="submit"
        variant={declaracaoAceita ? 'primary' : 'secondary'}
        size="lg"
        fullWidth
        loading={enviando}
        disabled={!declaracaoAceita}
      >
        Confirmar e enviar
      </CustomButton>
    </form>
  )
}

interface ConfirmacaoDeclaracaoSheetProps
  extends ConfirmacaoDeclaracaoFormProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
}

/**
 * O formulário dentro do bottom sheet. Ele só existe enquanto o sheet está aberto: fechar
 * desmonta o formulário e descarta o aceite — nada sobra para a próxima vez.
 */
export function ConfirmacaoDeclaracaoSheet({
  aberto,
  onAbertoChange,
  ...props
}: ConfirmacaoDeclaracaoSheetProps) {
  return (
    <BottomSheet
      open={aberto}
      onOpenChange={onAbertoChange}
      title="Declaração e confirmação"
    >
      {aberto && <ConfirmacaoDeclaracaoForm {...props} />}
    </BottomSheet>
  )
}

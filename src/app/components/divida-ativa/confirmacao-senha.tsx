'use client'

import { validarSenha } from '@/actions/divida-ativa/validar-senha'
import { Checkbox } from '@/components/ui/checkbox'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { formatarCpf } from '@/lib/divida-ativa-utils'
import type { ProvedorLogin } from '@/lib/provedor-login'
import { useId, useState } from 'react'

/** Texto da declaração — o mesmo do portal legado e da `poc_Imoveis`. */
export const TEXTO_DECLARACAO =
  'Declaro, sob as penas da lei, que os documentos anexados e informações apresentadas são autênticos e conferem com os originais.'

interface ConfirmacaoSenhaFormProps {
  nome: string
  cpf: string
  provedorLogin: ProvedorLogin
  /** "Minha conta Identidade Carioca", onde o cidadão cria ou troca a senha. */
  urlContaIdentidade: string | null
  /**
   * Envia o requerimento com a senha já pré-validada. Devolve a mensagem de erro para exibir
   * aqui, ou `null` quando deu certo (quem chama segue para a tela de sucesso).
   */
  onConfirmar: (senha: string) => Promise<string | null>
}

/**
 * Declaração e reautenticação — o "Assinar e enviar" do requerimento de parcelamento.
 *
 * Reproduz o modal da `poc_Imoveis` e o `reautenticar.jsp` do portal: aceite da declaração e a
 * senha da conta **Identidade Carioca**, pré-validada em `validarSenha` antes do envio (a API
 * revalida no envio de qualquer forma). "Assinar" é o nome herdado: não há assinatura digital,
 * só o aceite e a confirmação da senha.
 *
 * ### Quem entrou pelo gov.br
 *
 * A senha validada é a do Keycloak, não a do gov.br — e em produção o login vai direto ao gov.br.
 * Por isso a orientação para criar a senha aparece sempre; quando o token diz que o login foi
 * pelo gov.br, ela vem em destaque. O link abre em nova aba para o pedido em andamento não se
 * perder.
 *
 * A senha vive só no estado deste formulário e é apagada a cada tentativa, com sucesso ou não.
 */
export function ConfirmacaoSenhaForm({
  nome,
  cpf,
  provedorLogin,
  urlContaIdentidade,
  onConfirmar,
}: ConfirmacaoSenhaFormProps) {
  const idDeclaracao = useId()
  const [declaracaoAceita, setDeclaracaoAceita] = useState(false)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const entrouPeloGovbr = provedorLogin === 'govbr'

  async function assinarEEnviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enviando || !declaracaoAceita || !senha) return

    const senhaDigitada = senha
    setSenha('')
    setErro(null)
    setEnviando(true)

    try {
      const validacao = await validarSenha(senhaDigitada)
      if (!validacao.success) {
        setErro(validacao.error)
        return
      }
      if (!validacao.data.valida) {
        setErro(validacao.data.mensagem ?? 'Senha inválida.')
        return
      }

      setErro(await onConfirmar(senhaDigitada))
    } finally {
      setEnviando(false)
    }
  }

  const linkConta = urlContaIdentidade ? (
    <a
      href={urlContaIdentidade}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline"
    >
      Minha conta Identidade Carioca
    </a>
  ) : (
    'Minha conta Identidade Carioca'
  )

  return (
    <form onSubmit={assinarEEnviar} className="flex flex-col gap-4" noValidate>
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
          onCheckedChange={marcado => setDeclaracaoAceita(marcado === true)}
          className="mt-0.5"
        />
        <span className="text-sm font-normal leading-5 text-foreground">
          {TEXTO_DECLARACAO}
        </span>
      </label>

      <p className="text-sm font-medium leading-5 text-foreground">
        {nome} · CPF {formatarCpf(cpf)}
      </p>

      <div
        className={`rounded-2xl p-4 text-sm leading-5 ${
          entrouPeloGovbr
            ? 'bg-primary/10 text-foreground'
            : 'bg-card text-foreground-light'
        }`}
      >
        {entrouPeloGovbr ? (
          <>
            Você entrou pelo gov.br. Para confirmar, use a senha da sua conta{' '}
            <strong>Identidade Carioca</strong> — não a senha do gov.br. Se você
            ainda não tem essa senha, crie uma em {linkConta} (abre em nova aba)
            e volte aqui para concluir.
          </>
        ) : (
          <>
            Use a senha da sua conta <strong>Identidade Carioca</strong>. Se
            você entra pelo gov.br e ainda não tem essa senha, crie uma em{' '}
            {linkConta} (abre em nova aba) e volte aqui para concluir.
          </>
        )}
      </div>

      <CustomInput
        id="confirmacao-senha"
        label="Senha da conta Identidade Carioca"
        isRequired
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={event => {
          setSenha(event.target.value)
          if (erro) setErro(null)
        }}
        error={erro ?? undefined}
      />

      <CustomButton
        type="submit"
        variant={declaracaoAceita && senha ? 'primary' : 'secondary'}
        size="lg"
        fullWidth
        loading={enviando}
        disabled={!declaracaoAceita || !senha}
      >
        Assinar e enviar
      </CustomButton>
    </form>
  )
}

interface ConfirmacaoSenhaSheetProps
  extends Omit<ConfirmacaoSenhaFormProps, 'onConfirmar'> {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onConfirmar: ConfirmacaoSenhaFormProps['onConfirmar']
}

/**
 * O formulário dentro do bottom sheet. Ele só existe enquanto o sheet está aberto: fechar
 * desmonta o formulário e descarta senha e aceite — nada sobra para a próxima vez.
 */
export function ConfirmacaoSenhaSheet({
  aberto,
  onAbertoChange,
  ...props
}: ConfirmacaoSenhaSheetProps) {
  return (
    <BottomSheet
      open={aberto}
      onOpenChange={onAbertoChange}
      title="Declaração e confirmação"
    >
      {aberto && <ConfirmacaoSenhaForm {...props} />}
    </BottomSheet>
  )
}

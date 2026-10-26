'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { formatarCpf, formatarTelefone } from '@/lib/divida-ativa-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  type DadosRequerente,
  dadosRequerenteSchema,
} from './dados-requerimento-schema'
import {
  lerDadosRequerente,
  salvarDadosRequerente,
} from './dados-requerimento-storage'

interface DadosRequerenteFormProps {
  /** Nome e CPF do login: identificam o requerente e não são editáveis. */
  nome: string
  cpf: string
  /** Telefone e e-mail do perfil id.rio, quando existem — o ponto de partida do formulário. */
  perfil: DadosRequerente
  searchParamsAtual: Record<string, string>
}

/**
 * "Confirme seus dados" — etapa do requerimento entre o vínculo e a correspondência.
 *
 * Não existe no Figma: espelha "Dados do Requerente" do portal legado. O vínculo, que lá fica
 * neste bloco, aqui já foi escolhido na etapa anterior.
 *
 * Nome e CPF vêm do login e aparecem só para conferência — o requerimento é sempre de quem
 * está autenticado, e a Server Action lê os dois do token, não deste formulário. Telefone e
 * e-mail chegam preenchidos do perfil e podem ser trocados só para este pedido; o perfil não
 * muda.
 *
 * O que o cidadão digitou fica no `sessionStorage` e tem precedência sobre o perfil: quem volta
 * a esta tela reencontra a sua edição, não o valor do cadastro.
 */
export function DadosRequerenteForm({
  nome,
  cpf,
  perfil,
  searchParamsAtual,
}: DadosRequerenteFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DadosRequerente>({
    resolver: zodResolver(dadosRequerenteSchema),
    defaultValues: {
      telefone: formatarTelefone(perfil.telefone),
      email: perfil.email,
    },
  })

  // Em efeito: `sessionStorage` não existe no servidor.
  useEffect(() => {
    const salvo = lerDadosRequerente()
    if (salvo) reset(salvo)
  }, [reset])

  function continuar(dados: DadosRequerente) {
    salvarDadosRequerente(dados)

    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('etapa', 'correspondencia')
    router.push(`/divida-ativa/parcelamento/requerimento?${destino}`)
  }

  return (
    <form
      onSubmit={handleSubmit(continuar)}
      className="flex flex-1 flex-col px-4"
      noValidate
    >
      <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
        Confirme seus dados
      </h1>

      <p className="pb-6 text-sm font-normal leading-5 text-foreground-light">
        Usaremos este telefone e este e-mail para falar com você sobre o pedido
        de parcelamento.
      </p>

      <div className="mb-6 flex flex-col gap-0.5 rounded-2xl bg-card p-4">
        <span className="text-sm font-medium leading-5 text-foreground">
          {nome}
        </span>
        <span className="text-xs font-normal leading-4 text-foreground-light">
          CPF {formatarCpf(cpf)}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <CustomInput
          id="requerente-telefone"
          label="Telefone"
          isRequired
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(00) 00000-0000"
          error={errors.telefone?.message}
          {...register('telefone', {
            onChange: event =>
              setValue('telefone', formatarTelefone(event.target.value)),
          })}
        />

        <CustomInput
          id="requerente-email"
          label="E-mail"
          isRequired
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="pt-6 pb-2">
        <CustomButton type="submit" variant="primary" size="lg" fullWidth>
          Continuar
        </CustomButton>
      </div>
    </form>
  )
}

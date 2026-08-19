'use client'

import {
  type NomeImovelSchema,
  nomeImovelSchema,
} from '@/app/components/divida-ativa/nome-imovel-schema'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

interface NomeImovelFormProps {
  /** Inscrição validada no passo anterior — só transita, nada é gravado aqui. */
  inscricao: string
  /** Nome já digitado, para quem volta da confirmação sem perder o que escreveu. */
  nomeInicial?: string
}

/**
 * Passo intermediário do cadastro: um nome para o imóvel ("Minha Casa", "Casa de praia").
 *
 * ⚠️ O contrato ainda não tem onde gravar este valor (premissa P23 em
 * `docs/divida-ativa.md`) — ele viaja pela URL até a Server Action, que o descarta na
 * fronteira da API. A tela existe desde já porque é parte do fluxo do Figma; a persistência
 * chega com o campo no contrato.
 */
export function NomeImovelForm({
  inscricao,
  nomeInicial,
}: NomeImovelFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NomeImovelSchema>({
    resolver: zodResolver(nomeImovelSchema),
    defaultValues: { nome: nomeInicial ?? '' },
  })

  function onSubmit(data: NomeImovelSchema) {
    const params = new URLSearchParams({ inscricao })
    if (data.nome) params.set('nome', data.nome)

    router.push(`/divida-ativa/imoveis/novo/confirmar?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 px-4"
      noValidate
    >
      <CustomInput
        id="nome-imovel"
        aria-label="Nome do imóvel"
        placeholder="Escreva aqui"
        autoComplete="off"
        error={errors.nome?.message}
        {...register('nome')}
      />

      <p className="text-sm font-normal leading-5 text-foreground-light">
        Para facilitar a exibição dos seus débitos, insira um nome para esse
        imóvel, como &ldquo;Minha Casa&rdquo; ou &ldquo;Casa de praia&rdquo;.
      </p>

      <CustomButton
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isSubmitting}
        className="mt-4"
      >
        Continuar
      </CustomButton>
    </form>
  )
}

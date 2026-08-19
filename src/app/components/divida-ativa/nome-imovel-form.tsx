'use client'

import { adicionarImovel } from '@/actions/divida-ativa/adicionar-imovel'
import {
  type NomeImovelSchema,
  nomeImovelSchema,
} from '@/app/components/divida-ativa/nome-imovel-schema'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface NomeImovelFormProps {
  /** Inscrição confirmada no passo anterior — é ela que a action grava. */
  inscricao: string
}

/**
 * Último passo do cadastro: um nome para o imóvel ("Minha Casa", "Casa de praia"). O
 * "Continuar" daqui é quem grava — a confirmação anterior só consultou.
 *
 * ⚠️ O contrato ainda não tem onde gravar o nome (premissa P23 em
 * `docs/divida-ativa.md`) — ele chega à Server Action, que o descarta na fronteira da
 * API. A tela existe desde já porque é parte do fluxo do Figma; a persistência chega com
 * o campo no contrato.
 */
export function NomeImovelForm({ inscricao }: NomeImovelFormProps) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NomeImovelSchema>({
    resolver: zodResolver(nomeImovelSchema),
    defaultValues: { nome: '' },
  })

  function onSubmit(data: NomeImovelSchema) {
    startTransition(async () => {
      const resultado = await adicionarImovel(inscricao, data.nome || undefined)

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      router.push('/divida-ativa/imoveis/novo/sucesso')
    })
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
        disabled={enviando}
        className="mt-4"
      >
        Continuar
      </CustomButton>
    </form>
  )
}

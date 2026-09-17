'use client'

import { renomearImovel } from '@/actions/divida-ativa/renomear-imovel'
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

interface EditarNomeImovelFormProps {
  /** Id local do cadastro — é por ele que a API renomeia. */
  id: number
  /** Nome gravado hoje. `null` quando o cidadão pulou o passo no cadastro. */
  nomeAtual: string | null
}

/**
 * Edição do nome de um imóvel já cadastrado, irmã de `NomeImovelForm`.
 *
 * São dois componentes e não um parametrizado porque o que muda não é só a copy: aqui o
 * campo nasce preenchido, o submit chama outra action e o destino do sucesso é a lista, não
 * a tela de cadastro concluído. O que os dois compartilham de verdade — a regra do campo —
 * mora em `nomeImovelSchema`, e é de lá que vem o limite de tamanho.
 *
 * Salvar com o campo vazio **apaga** o nome. É intencional: sem isso, um nome dado por
 * engano ficaria para sempre, já que não existe outra forma de removê-lo.
 */
export function EditarNomeImovelForm({
  id,
  nomeAtual,
}: EditarNomeImovelFormProps) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NomeImovelSchema>({
    resolver: zodResolver(nomeImovelSchema),
    defaultValues: { nome: nomeAtual ?? '' },
  })

  function onSubmit(data: NomeImovelSchema) {
    startTransition(async () => {
      const resultado = await renomearImovel(id, data.nome)

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      router.push('/divida-ativa/imoveis')
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
        Salvar
      </CustomButton>
    </form>
  )
}

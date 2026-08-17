'use client'

import {
  type InscricaoImobiliariaSchema,
  inscricaoImobiliariaSchema,
} from '@/app/components/divida-ativa/inscricao-schema'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import {
  formatarInscricaoImobiliaria,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

/**
 * Campo aberto com máscara aplicada a cada tecla. O que sai daqui para a URL — e depois para
 * a API — são **somente os dígitos**: a máscara é exibição, nunca transporte.
 */
export function InscricaoImobiliariaForm() {
  const router = useRouter()

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InscricaoImobiliariaSchema>({
    resolver: zodResolver(inscricaoImobiliariaSchema),
    defaultValues: { inscricao: '' },
  })

  const inscricao = watch('inscricao')

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue('inscricao', formatarInscricaoImobiliaria(event.target.value), {
      shouldValidate: false,
    })
  }

  function onSubmit(data: InscricaoImobiliariaSchema) {
    router.push(
      `/divida-ativa/imoveis/novo/confirmar?inscricao=${somenteDigitos(data.inscricao)}`
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 px-4"
      noValidate
    >
      <CustomInput
        id="inscricao-imobiliaria"
        aria-label="Inscrição imobiliária"
        placeholder="Escreva aqui"
        inputMode="numeric"
        autoComplete="off"
        value={inscricao}
        onChange={handleChange}
        error={errors.inscricao?.message}
      />

      <p className="text-sm font-normal leading-5 text-foreground-light">
        Ele está no canto superior direito do boleto que você recebeu no
        endereço do imóvel.
        <br />
        Digite somente números, sem pontos ou traços.
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

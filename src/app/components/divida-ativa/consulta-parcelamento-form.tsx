'use client'

import type { ModoConsultaConfig } from '@/app/components/divida-ativa/modos-consulta'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { somenteDigitos } from '@/lib/divida-ativa-utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ConsultaParcelamentoFormProps {
  modo: ModoConsultaConfig
}

/**
 * Segundo passo da consulta: um campo só, com o rótulo do modo escolhido.
 *
 * Campo aberto com máscara aplicada a cada tecla. O que sai daqui para a URL — e depois para
 * a API — são **somente os dígitos**: a máscara é exibição, nunca transporte. Vale para os
 * três modos, inclusive a execução fiscal, cujo número o cidadão cola já pontuado da citação.
 *
 * Sem React Hook Form aqui, ao contrário do formulário de cadastro: é um campo, uma regra de
 * formato e nenhum estado de servidor. O RHF entra quando houver o que ele resolve.
 */
export function ConsultaParcelamentoForm({
  modo,
}: ConsultaParcelamentoFormProps) {
  const router = useRouter()
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValor(modo.formatar(event.target.value))

    // Some com o erro assim que o cidadão volta a digitar: manter a mensagem enquanto ele
    // corrige é ruído, e o "Continuar" revalida de qualquer forma.
    if (erro) setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const digitos = somenteDigitos(valor)

    if (digitos === '') {
      setErro(modo.mensagemVazio)
      return
    }

    if (!modo.validar(valor)) {
      setErro(modo.mensagemFormato)
      return
    }

    router.push(
      `/divida-ativa/parcelamento/debitos?${modo.parametro}=${digitos}`
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col px-4"
      noValidate
    >
      <CustomInput
        id={`consulta-${modo.id}`}
        label={modo.rotuloCampo}
        placeholder="Escreva aqui"
        inputMode="numeric"
        autoComplete="off"
        value={valor}
        onChange={handleChange}
        error={erro ?? undefined}
      />

      <CustomButton
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        className="mt-auto"
      >
        Continuar
      </CustomButton>
    </form>
  )
}

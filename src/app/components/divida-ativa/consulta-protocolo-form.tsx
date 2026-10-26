'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { somenteDigitos } from '@/lib/divida-ativa-utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Tamanho máximo do número do protocolo. O DAM devolve até nove dígitos com zeros à
 * esquerda (`000146679`); dez dá folga sem aceitar um número colado com o ano na frente.
 */
const TAMANHO_MAXIMO_PROTOCOLO = 10

/** Rota do requerimento de um protocolo. Só dígitos entram na URL. */
export function urlRequerimento(protocolo: string): string {
  return `/divida-ativa/acompanhamento/requerimentos/${somenteDigitos(protocolo)}`
}

/**
 * Consulta de um requerimento pelo número do protocolo.
 *
 * O protocolo que o DAM dá ao requerimento é um número sem o ano (ex.: `146679`); o ano é
 * um campo à parte e a API busca o requerimento só pelo número. Por isso o rótulo avisa
 * "sem o ano" e o campo aceita apenas dígitos — qualquer outro caractere some ao digitar.
 *
 * O "Continuar" fica desabilitado enquanto o campo está vazio, como no Figma: não há
 * regra de formato além de "ter número", então não existe erro a exibir. A validação de
 * verdade (existe? é deste CPF?) é da API e aparece na tela do requerimento.
 */
export function ConsultaProtocoloForm() {
  const router = useRouter()
  const [protocolo, setProtocolo] = useState('')

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setProtocolo(
      somenteDigitos(event.target.value).slice(0, TAMANHO_MAXIMO_PROTOCOLO)
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!protocolo) return

    router.push(urlRequerimento(protocolo))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col" noValidate>
      <CustomInput
        id="consulta-protocolo"
        label="Consultar pelo n° do protocolo (sem o ano)"
        placeholder="Escreva aqui"
        inputMode="numeric"
        autoComplete="off"
        maxLength={TAMANHO_MAXIMO_PROTOCOLO}
        value={protocolo}
        onChange={handleChange}
      />

      <div className="mt-auto pt-6">
        <CustomButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={protocolo === ''}
        >
          Continuar
        </CustomButton>
      </div>
    </form>
  )
}

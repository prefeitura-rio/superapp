'use client'

import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Controller, useFormContext } from 'react-hook-form'

export function TermosUsoAccordionContent() {
  const { control } = useFormContext()

  return (
    <div className="space-y-6">
      <p className="text-primary text-sm font-normal leading-5">
        Ao preencher e enviar este formulário, você declara estar ciente do
        conteúdo dos Termos de Uso e da Política de Privacidade do Google -{' '}
        <Link
          href="https://pref.rio"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Termo I
        </Link>{' '}
        e{' '}
        <Link
          href="https://pref.rio"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Termo II
        </Link>
        , que regem o tratamento dos dados pessoais informados, os quais serão
        tratados nos termos informados pelo Google Internacional.
      </p>

      <Controller
        control={control}
        name="termosAceitos"
        render={({ field }) => (
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => field.onChange(!field.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                field.onChange(!field.value)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="text-foreground text-sm font-normal leading-5">
              Ciente e concordo
            </span>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              ref={field.ref}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      />
    </div>
  )
}

import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../save-termos-accept-action', () => ({
  saveTermosAcceptAction: vi.fn(),
}))

import { TermosUsoAccordionContent } from '../termos-uso-accordion-content'

function FormWrapper({ children }: { children: ReactNode }) {
  const methods = useForm({ defaultValues: { termosAceitos: false } })
  return <FormProvider {...methods}>{children}</FormProvider>
}

function renderTermos() {
  return render(
    <FormWrapper>
      <TermosUsoAccordionContent cpf="12345678900" />
    </FormWrapper>
  )
}

describe('TermosUsoAccordionContent — link dos termos', () => {
  it('leva ao detalhe "Termos de uso: Empregos", marcando o currículo como origem', () => {
    renderTermos()

    const link = screen.getByRole('link', {
      name: /Termos de Uso e nosso Aviso de Privacidade/,
    })
    expect(link).toHaveAttribute(
      'href',
      '/termos-de-uso/empregos?origem=curriculo'
    )
  })

  it('abre em nova aba para não perder o que já foi preenchido', () => {
    renderTermos()

    const link = screen.getByRole('link', {
      name: /^Termos de Uso e nosso Aviso de Privacidade\s*\(abre em nova aba\)$/,
    })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('mantém a frase, o sublinhado, o checkbox e os botões', () => {
    const { container } = renderTermos()

    expect(container.querySelector('p')?.textContent).toBe(
      'Ao preencher e enviar este formulário, você declara que leu e concorda com nossos Termos de Uso e nosso Aviso de Privacidade (abre em nova aba). Seus dados serão compartilhados com a instituição responsável por esta vaga para fins de recrutamento e seleção.'
    )
    expect(
      screen.getByRole('link', { name: /Termos de Uso e nosso Aviso/ })
    ).toHaveClass('underline')
    expect(
      screen.getByText('Li e concordo com os termos de uso')
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled()
  })

  it('não aponta mais para a página antiga de termos', () => {
    const { container } = renderTermos()

    expect(
      container.querySelector('a[href^="/servicos/trabalho/termos-de-uso"]')
    ).toBeNull()
  })
})

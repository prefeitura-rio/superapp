import type { TermosDeUsoDocument } from '@/constants/termos-de-uso/types'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/**
 * Critério do card: "trocar o texto de uma plataforma exige alterar só o
 * conteúdo, não o componente". Aqui o componente e a página recebem um texto
 * inventado e mostram exatamente ele, sem nenhuma mudança na tela.
 */

const FAKE_DOCUMENT: TermosDeUsoDocument = {
  updatedAt: 'Maio de 2027',
  version: '2.0',
  parts: [
    {
      sections: [
        {
          title: '1. Seção inventada',
          blocks: [
            { type: 'paragraph', text: 'Parágrafo de teste da versão 2.0.' },
            { type: 'list', items: ['a) Primeiro item;', 'b) Segundo item.'] },
          ],
        },
        {
          title: '2. Outra seção',
          blocks: [{ type: 'paragraph', text: 'Texto da segunda seção.' }],
        },
      ],
    },
    {
      title: 'II. Parte extra de teste',
      intro: [{ type: 'paragraph', text: 'Introdução da parte extra.' }],
      sections: [
        {
          title: '1. Única seção da parte extra',
          blocks: [{ type: 'paragraph', text: 'Fim do documento de teste.' }],
        },
      ],
    },
  ],
}

const fakeContentFor = vi.hoisted(() => ({ slug: 'cursos' }))

vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header />,
}))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
vi.mock('@/constants/termos-de-uso/content', async importOriginal => {
  const original =
    await importOriginal<typeof import('@/constants/termos-de-uso/content')>()
  return {
    ...original,
    getTermosDeUsoDocument: (slug: string) =>
      slug === fakeContentFor.slug
        ? FAKE_DOCUMENT
        : original.getTermosDeUsoDocument(slug),
  }
})

import TermosDeUsoPlataformaPage from '../[plataforma]/page'
import { TermosDeUsoDetail } from '../components/termos-de-uso-detail'

const pageProps = (plataforma: string) => ({
  params: Promise.resolve({ plataforma }),
})

describe('TermosDeUsoDetail com outro texto', () => {
  it('mostra versão, data, seções e listas do documento recebido', () => {
    render(
      <TermosDeUsoDetail
        platform={{ slug: 'teste', name: 'Plataforma Teste' }}
        document={FAKE_DOCUMENT}
      />
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Termos de uso: Plataforma Teste',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Última atualização: Maio de 2027 - Versão 2.0')
    ).toBeInTheDocument()

    const article = screen.getByRole('article')
    expect(
      within(article)
        .getAllByRole('heading')
        .map(heading => [heading.tagName, heading.textContent])
    ).toEqual([
      ['H2', '1. Seção inventada'],
      ['H2', '2. Outra seção'],
      ['H2', 'II. Parte extra de teste'],
      ['H3', '1. Única seção da parte extra'],
    ])
    expect(
      within(article)
        .getAllByRole('listitem')
        .map(item => item.textContent)
    ).toEqual(['a) Primeiro item;', 'b) Segundo item.'])
    expect(
      within(article).getByText('Introdução da parte extra.')
    ).toBeInTheDocument()
    // A parte extra repete data e versão do documento, não as da v1.0.
    expect(
      within(article).getByText('Maio de 2027 - Versão 2.0')
    ).toBeInTheDocument()
    expect(screen.queryByText(/Abril de 2026/)).not.toBeInTheDocument()
  })

  it('trocar o texto de uma plataforma não afeta as outras', async () => {
    const cursos = render(await TermosDeUsoPlataformaPage(pageProps('cursos')))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Termos de uso: Cursos' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Última atualização: Maio de 2027 - Versão 2.0')
    ).toBeInTheDocument()
    expect(screen.getByText('Fim do documento de teste.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '15. Foro' })).toBeNull()
    cursos.unmount()

    render(await TermosDeUsoPlataformaPage(pageProps('empregos')))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Termos de uso: Empregos' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Última atualização: Abril de 2026 - Versão 1.0')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '15. Foro' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Fim do documento de teste.')).toBeNull()
  })
})

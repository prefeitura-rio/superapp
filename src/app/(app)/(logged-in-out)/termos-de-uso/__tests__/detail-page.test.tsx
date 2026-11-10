import { PREF_RIO_V1_PARTS } from '@/constants/termos-de-uso/content/pref-rio-v1'
import { TERMOS_DE_USO_PLATFORMS } from '@/constants/termos-de-uso/platforms'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header-global" />,
}))
vi.mock('@/app/components/oportunidades/oportunidades-sub-header', () => ({
  OportunidadesSubHeader: () => <header />,
}))

const notFoundError = new Error('NEXT_NOT_FOUND')
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw notFoundError
  },
}))

import { TermosDeUsoContent } from '../../servicos/(servicos)/trabalho/termos-de-uso/termos-de-uso-content'
import TermosDeUsoPlataformaPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from '../[plataforma]/page'
import * as detailPageModule from '../[plataforma]/page'
import { TermosDeUsoDetail } from '../components/termos-de-uso-detail'

const pageProps = (plataforma: string) => ({
  params: Promise.resolve({ plataforma }),
})

async function renderDetail(slug: string) {
  return render(await TermosDeUsoPlataformaPage(pageProps(slug)))
}

describe('/termos-de-uso/[plataforma]', () => {
  it('gera uma página por plataforma e nenhuma outra', () => {
    expect(generateStaticParams()).toEqual(
      TERMOS_DE_USO_PLATFORMS.map(({ slug }) => ({ plataforma: slug }))
    )
    expect(dynamicParams).toBe(false)
  })

  it('não é force-static: precisa do nonce da CSP por requisição para a fila (rio-queue) rodar', () => {
    expect(detailPageModule).not.toHaveProperty('dynamic', 'force-static')
  })

  it.each(
    TERMOS_DE_USO_PLATFORMS.map(platform => [platform.name, platform.slug])
  )(
    '%s abre o mesmo detalhe com título e conteúdo próprios',
    async (name, slug) => {
      await renderDetail(slug)

      expect(screen.getByTestId('header-global')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: `Termos de uso: ${name}`,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Última atualização: Abril de 2026 - Versão 1.0')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: '1. Da ciência do Termo de uso' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: '15. Foro' })
      ).toBeInTheDocument()

      const back = screen.getByRole('link', {
        name: 'Voltar para Termos de uso',
      })
      expect(back).toHaveAttribute('href', '/termos-de-uso')
    }
  )

  it('seções do Termo são h2; o Aviso de Privacidade é h2 e suas seções h3', async () => {
    await renderDetail('cursos')

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: '1. Da ciência do Termo de uso',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'II. Aviso de Privacidade – Plataforma Pref.Rio',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: '1. Definições' })
    ).toBeInTheDocument()
  })

  it('slug desconhecido vira 404', async () => {
    await expect(
      TermosDeUsoPlataformaPage(pageProps('ouvidoria'))
    ).rejects.toBe(notFoundError)
  })

  it('o título da aba leva o nome da plataforma', async () => {
    expect(await generateMetadata(pageProps('prefrio-whatsapp'))).toMatchObject(
      {
        title: 'Termos de uso: PrefRio Whatsapp',
      }
    )
    expect(await generateMetadata(pageProps('ouvidoria'))).toEqual({})
  })
})

/**
 * O card pede o texto atual "copiado integralmente". A fonte é a página de
 * Trabalho (a mesma servida em staging): todo parágrafo e item de lista dela
 * precisa aparecer aqui, na mesma ordem. Os títulos mudam só de caixa
 * (o handoff usa caixa de frase, sem dois-pontos).
 *
 * Renderiza o texto v1.0 direto, e não uma plataforma: o teste continua
 * válido quando alguma plataforma ganhar texto próprio.
 */
describe('texto v1.0 do detalhe x página atual de Trabalho', () => {
  const VERSION_LINE = /^(Última atualização: )?Abril de 2026 - Versão 1\.0$/

  function renderV1() {
    const { container } = render(
      <TermosDeUsoDetail
        platform={{ slug: 'v1', name: 'Texto v1.0' }}
        document={{
          updatedAt: 'Abril de 2026',
          version: '1.0',
          parts: PREF_RIO_V1_PARTS,
        }}
      />
    )
    return within(container).getByRole('article')
  }

  function bodyTexts(root: HTMLElement) {
    return [...root.querySelectorAll('p, li')]
      .map(el => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
      .filter(text => text && !VERSION_LINE.test(text))
  }

  function headingTexts(root: HTMLElement, selector: string) {
    return [...root.querySelectorAll(selector)].map(el =>
      (el.textContent ?? '').trim()
    )
  }

  it('todo parágrafo e item de lista é idêntico e na mesma ordem', async () => {
    const original = render(<TermosDeUsoContent />)
    const originalTexts = bodyTexts(original.container)
    original.unmount()

    expect(originalTexts.length).toBeGreaterThan(100)
    expect(bodyTexts(renderV1())).toEqual(originalTexts)
  })

  it('os títulos das seções são os mesmos, só em caixa de frase', async () => {
    const original = render(<TermosDeUsoContent />)
    // O primeiro h1 ("I. TERMO DE USO - …") vira o título da página.
    const originalHeadings = headingTexts(original.container, 'h1, h2')
      .slice(1)
      .map(text => text.replace(/:$/, ''))
    original.unmount()

    const headings = headingTexts(renderV1(), 'h2, h3').map(text =>
      text.toLocaleUpperCase('pt-BR')
    )

    expect(headings).toEqual(originalHeadings)
  })
})

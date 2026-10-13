import { TextBlock } from '@/app/components/service/TextBlocks'
import { ServiceHtmlContent } from '@/app/components/service/service-html-content'
import { avaliacaoDeRiscoHtml } from '@/lib/carta-servicos/__tests__/fixtures/avaliacao-de-risco'
import { sanitizeServiceHtml } from '@/lib/carta-servicos/sanitize-service-html'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('ServiceHtmlContent', () => {
  it('renders sanitized markup and drops script tags', () => {
    const html = sanitizeServiceHtml(
      '<p>Texto visível</p><script>alert(1)</script>'
    )
    const { container } = render(<ServiceHtmlContent content={html} />)

    expect(screen.getByText('Texto visível')).toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('p')).not.toBeNull()
  })

  it('keeps the full html block in the dom when the text is long', () => {
    const html = sanitizeServiceHtml(
      `${avaliacaoDeRiscoHtml.fullDescription}<h3>Fim do conteúdo</h3>`
    )

    render(
      <TextBlock
        title="Descrição completa do serviço"
        content={html}
        contentFormat="html"
        renderContent={content => <ServiceHtmlContent content={content} />}
      />
    )

    expect(
      screen.getByRole('heading', { name: 'Descrição completa do serviço' })
    ).toBeInTheDocument()
    expect(screen.getByText('Fim do conteúdo')).toBeInTheDocument()
    expect(screen.getByText('O que é:')).toBeInTheDocument()
  })
})

// @vitest-environment node
import { VehicleRegistrationFlow } from '@/app/(app)/(logged-in)/carteira/cadmicro/adicionar-veiculo/vehicle-registration-flow'
import { PdfPreviewDialog } from '@/app/components/cadmicro/pdf-preview-dialog'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

/**
 * O pdfjs-dist (via react-pdf) acessa `DOMMatrix` ao ser importado. Importado
 * de forma estática pelo PdfPreviewDialog, quebrava o SSR de toda página que
 * usa o dialog: /carteira/cadmicro/adicionar-veiculo respondia HTTP 500 e só
 * aparecia porque o React refazia a página no cliente. O ambiente `node` deste
 * arquivo não tem `DOMMatrix`, como o servidor do Next.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/carteira/cadmicro/adicionar-veiculo',
  useSearchParams: () => new URLSearchParams(),
}))

describe('CadMicro: SSR sem react-pdf', () => {
  it('renderiza o fluxo de adicionar veículo no servidor', () => {
    const html = renderToString(
      <QueryClientProvider client={new QueryClient()}>
        <VehicleRegistrationFlow
          ownerInfo={{
            cpf: '00000000000',
            name: 'Teste',
            phoneDisplay: '(21) 900000000',
            emailDisplay: 'teste@example.com',
            ownerPhone: '21900000000',
            ownerEmail: 'teste@example.com',
            phoneNeedsUpdate: false,
            emailNeedsUpdate: false,
          }}
        />
      </QueryClientProvider>
    )

    expect(html).toContain('Informações do Veículo')
  })

  it('renderiza o PdfPreviewDialog aberto no servidor', () => {
    expect(() =>
      renderToString(
        <PdfPreviewDialog
          open
          onOpenChange={() => {}}
          fileUrl="blob:https://example.com/arquivo"
        />
      )
    ).not.toThrow()
  })
})

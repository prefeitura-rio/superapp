import {
  CartaFetchError,
  cartaPdfFileName,
  fetchCartaOrgUnit,
  fetchCartaOrgUnitServices,
  isValidSiciCode,
} from '@/lib/carta-servicos/org-units'
import { getCachedCartaPdf } from '@/lib/carta-servicos/pdf/render-carta-pdf'
import type { NextRequest } from 'next/server'

// react-pdf, jsdom e fs precisam do runtime Node.
export const runtime = 'nodejs'

/**
 * GET /api/carta-de-servicos/{siciCode}/pdf
 *
 * Busca todas as páginas de `GET /api/public/org-units/{siciCode}/services` na
 * app-catalogo e devolve a Carta de Serviços do órgão em PDF (A4), pronta para o
 * navegador baixar. Decisão de gerar no servidor: `docs/carta-de-servicos-pdf.md`.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siciCode: string }> }
) {
  const { siciCode } = await params

  if (!isValidSiciCode(siciCode)) {
    return Response.json({ error: 'Código SICI inválido' }, { status: 400 })
  }

  try {
    const org = await fetchCartaOrgUnit(siciCode)
    if (!org) {
      return Response.json({ error: 'Órgão não encontrado' }, { status: 404 })
    }

    const services = await fetchCartaOrgUnitServices(siciCode)
    if (services.length === 0) {
      return Response.json(
        { error: 'Órgão sem serviços publicados' },
        { status: 404 }
      )
    }

    const pdf = await getCachedCartaPdf(org, services)
    const fileName = cartaPdfFileName(org)

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdf.byteLength),
        'Content-Disposition': `attachment; filename="${fileName}"`,
        // Os dados da app-catalogo já ficam 10 min no data cache do Next.
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('[carta-de-servicos] falha ao gerar PDF', { siciCode, error })
    const status = error instanceof CartaFetchError ? 502 : 500
    return Response.json(
      { error: 'Não foi possível gerar a Carta de Serviços' },
      { status }
    )
  }
}

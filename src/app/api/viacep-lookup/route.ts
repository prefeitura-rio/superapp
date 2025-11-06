import { findBestCepMatch } from '@/lib/cep-utils'
import type { ViaCepResponse } from '@/types/address'
import { type NextRequest, NextResponse } from 'next/server'
import { withSpan, addSpanEvent } from '@/lib/telemetry'

export async function GET(req: NextRequest) {
  return withSpan('api.viacep_lookup', async (span) => {
    const uf = req.nextUrl.searchParams.get('uf')
    const cidade = req.nextUrl.searchParams.get('cidade')
    const logradouro = req.nextUrl.searchParams.get('logradouro')
    const numero = req.nextUrl.searchParams.get('numero')

    span.setAttribute('viacep.uf', uf || '')
    span.setAttribute('viacep.cidade', cidade || '')
    span.setAttribute('viacep.has_numero', !!numero)

    if (!uf || !cidade || !logradouro) {
      addSpanEvent('viacep.validation.failed', { reason: 'missing_params' })
      return NextResponse.json(
        { error: 'Missing required parameters: uf, cidade, logradouro' },
        { status: 400 }
      )
    }

    // ViaCEP requires minimum 3 characters for cidade and logradouro
    if (cidade.length < 3 || logradouro.length < 3) {
      addSpanEvent('viacep.validation.failed', { reason: 'insufficient_length' })
      return NextResponse.json(
        { error: 'Cidade and logradouro must have at least 3 characters' },
        { status: 400 }
      )
    }

    try {
      // Clean and format parameters for ViaCEP
      const cleanUf = uf.trim().toUpperCase()
      const cleanCidade = cidade.trim()
      const cleanLogradouro = logradouro.trim()

      console.log('ViaCEP lookup params:', {
        uf: cleanUf,
        cidade: cleanCidade,
        logradouro: cleanLogradouro,
      })

      addSpanEvent('viacep.api.request.start')

      // Build ViaCEP URL
      const url = `https://viacep.com.br/ws/${encodeURIComponent(cleanUf)}/${encodeURIComponent(cleanCidade)}/${encodeURIComponent(cleanLogradouro)}/json/`

      const res = await fetch(url)

      span.setAttribute('http.status_code', res.status)

      if (!res.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch from ViaCEP' },
          { status: res.status }
        )
      }

      const data: ViaCepResponse[] = await res.json()

      // Check if ViaCEP returned an error or empty array
      if (!Array.isArray(data) || data.length === 0) {
        addSpanEvent('viacep.no_results')
        return NextResponse.json({ cep: null })
      }

      console.log(`Found ${data.length} CEP results for ${cleanLogradouro}`)

      // Find the best match using utility function
      const bestMatch = findBestCepMatch(data, numero || undefined)

      console.log(
        'Selected CEP:',
        bestMatch.cep,
        'Complement:',
        bestMatch.complemento
      )

      addSpanEvent('viacep.cep.found', {
        'results.count': data.length,
        'cep.selected': bestMatch.cep,
      })

      return NextResponse.json({
        cep: bestMatch.cep,
        logradouro: bestMatch.logradouro,
        complemento: bestMatch.complemento,
        bairro: bestMatch.bairro,
        cidade: bestMatch.localidade,
        uf: bestMatch.uf,
      })
    } catch (error) {
      console.error('Error in ViaCEP lookup:', error)
      span.recordException(error as Error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

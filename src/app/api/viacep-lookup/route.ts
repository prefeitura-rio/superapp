import { findBestCepMatch } from '@/lib/cep-utils'
import type { ViaCepResponse } from '@/types/address'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const uf = req.nextUrl.searchParams.get('uf')
  const cidade = req.nextUrl.searchParams.get('cidade')
  const logradouro = req.nextUrl.searchParams.get('logradouro')
  const numero = req.nextUrl.searchParams.get('numero')

  if (!uf || !cidade || !logradouro) {
    return NextResponse.json(
      { error: 'Missing required parameters: uf, cidade, logradouro' },
      { status: 400 }
    )
  }

  // ViaCEP requires minimum 3 characters for cidade and logradouro
  if (cidade.length < 3 || logradouro.length < 3) {
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

    // Build ViaCEP URL
    const url = `https://viacep.com.br/ws/${encodeURIComponent(cleanUf)}/${encodeURIComponent(cleanCidade)}/${encodeURIComponent(cleanLogradouro)}/json/`

    const res = await fetch(url)

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from ViaCEP' },
        { status: res.status }
      )
    }

    const data: ViaCepResponse[] = await res.json()

    // Check if ViaCEP returned an error or empty array
    if (!Array.isArray(data) || data.length === 0) {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { CertificateTemplate } from '@/lib/certificate-template-mapping'

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'lib', 'templates')

const VALID_TEMPLATES: CertificateTemplate[] = [
  'juvrio',
  'planetario',
  'smac',
  'smpd',
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ template: string }> }
) {
  const resolvedParams = await params
  const template = resolvedParams.template.replace(/\.pdf$/, '') // Remove .pdf se presente

  // Valida se o template é válido
  if (!VALID_TEMPLATES.includes(template as CertificateTemplate)) {
    return NextResponse.json(
      { error: `Template inválido: ${template}` },
      { status: 400 }
    )
  }

  try {
    const filePath = path.join(TEMPLATES_DIR, `${template}.pdf`)
    const fileBuffer = await fs.readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${template}.pdf"`,
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    })
  } catch (error) {
    console.error(`Erro ao carregar template ${template}:`, error)
    return NextResponse.json(
      { error: `Template não encontrado: ${template}` },
      { status: 404 }
    )
  }
}


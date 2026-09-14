import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  CERTIFICATE_TEMPLATES,
  getCertificateTemplate,
  usesNewCertificateLayout,
} from '@/lib/certificate-template-mapping'
import type { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { GET } from '../route'

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'lib', 'templates')

/** A rota não usa o objeto request — basta um stub para satisfazer a assinatura. */
const request = {} as NextRequest

function callRoute(template: string) {
  return GET(request, { params: Promise.resolve({ template }) })
}

describe('GET /api/templates/[template]', () => {
  it.each([...CERTIFICATE_TEMPLATES])(
    'serve o template "%s" como PDF',
    async template => {
      const response = await callRoute(template)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/pdf')

      const body = new Uint8Array(await response.arrayBuffer())
      // Assinatura de arquivo PDF: %PDF
      expect(Array.from(body.slice(0, 4))).toEqual([0x25, 0x50, 0x44, 0x46])
    }
  )

  it('aceita o nome do template com sufixo .pdf', async () => {
    const response = await callRoute('smte.pdf')
    expect(response.status).toBe(200)
  })

  it('rejeita template não mapeado com 400', async () => {
    const response = await callRoute('secretaria-inexistente')

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Template inválido: secretaria-inexistente',
    })
  })

  it('não serve arquivo fora do diretório de templates (path traversal)', async () => {
    const response = await callRoute('../../../package')
    expect(response.status).toBe(400)
  })
})

describe('consistência do catálogo de certificados', () => {
  it('todo template mapeado tem PDF em src/lib/templates', async () => {
    const arquivos = await fs.readdir(TEMPLATES_DIR)

    for (const template of CERTIFICATE_TEMPLATES) {
      expect(arquivos, `falta ${template}.pdf`).toContain(`${template}.pdf`)
    }
  })

  it('todo PDF em src/lib/templates está mapeado para algum órgão', async () => {
    const arquivos = await fs.readdir(TEMPLATES_DIR)
    const naoMapeados = arquivos
      .filter(f => f.endsWith('.pdf'))
      .map(f => f.replace(/\.pdf$/, ''))
      .filter(nome => !CERTIFICATE_TEMPLATES.includes(nome as never))

    expect(naoMapeados).toEqual([])
  })

  it('todo template declara explicitamente o layout', () => {
    for (const template of CERTIFICATE_TEMPLATES) {
      expect(typeof usesNewCertificateLayout(template)).toBe('boolean')
    }
  })

  it('orgao_id não mapeado não resolve template', () => {
    expect(getCertificateTemplate('00000')).toBeNull()
  })
})

// @vitest-environment node
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  CERTIFICATE_TEMPLATES,
  usesNewCertificateLayout,
} from '@/lib/certificate-template-mapping'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'

/**
 * Garante que os templates em `src/lib/templates/` são "mudos": o design entrega
 * um mockup com o texto do certificado desenhado (`[NOME COMPLETO DO PARTICIPANTE]`,
 * `[nome da capacitação]`...), e o `pdf-lib` carimba os dados reais por cima.
 * Se o mockup for commitado sem remover esse texto, a rota e os demais testes
 * passam e o certificado sai com texto sobreposto.
 */

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'lib', 'templates')

/** Dimensões da página do layout v2 (pontos PDF). */
const V2_PAGE = { width: 841, height: 595 }

/**
 * Linha de base mais alta permitida no layout v2. As assinaturas ficam abaixo
 * de y≈92; o miolo carimbado por `addTextLayoutV2` vai de y=490 até ~y=200.
 */
const V2_MAX_TEXT_BASELINE_Y = 150

interface TemplateTextItem {
  text: string
  x: number
  y: number
}

async function readTemplatePage(template: string) {
  const data = new Uint8Array(
    await readFile(path.join(TEMPLATES_DIR, `${template}.pdf`))
  )
  const doc = await getDocument({ data, verbosity: 0 }).promise
  const page = await doc.getPage(1)
  const [, , width, height] = page.view
  const { items } = await page.getTextContent()

  const texts: TemplateTextItem[] = items
    .filter(item => 'str' in item && item.str.trim() !== '')
    .map(item => {
      const { str, transform } = item as { str: string; transform: number[] }
      return { text: str, x: transform[4], y: transform[5] }
    })

  return { numPages: doc.numPages, width, height, texts }
}

const V2_TEMPLATES = CERTIFICATE_TEMPLATES.filter(usesNewCertificateLayout)

describe('conteúdo dos templates de certificado', () => {
  it.each([...CERTIFICATE_TEMPLATES])(
    'template "%s" não contém placeholder do mockup',
    async template => {
      const { texts } = await readTemplatePage(template)
      const placeholders = texts.filter(({ text }) => /[[\]]/.test(text))

      expect(placeholders).toEqual([])
    }
  )

  it.each([...V2_TEMPLATES])(
    'template "%s" (v2) tem uma página no tamanho do layout v2',
    async template => {
      const { numPages, width, height } = await readTemplatePage(template)

      expect(numPages).toBe(1)
      expect({ width, height }).toEqual(V2_PAGE)
    }
  )

  it.each([...V2_TEMPLATES])(
    'template "%s" (v2) só tem texto na faixa das assinaturas',
    async template => {
      const { texts } = await readTemplatePage(template)
      const textoNoMiolo = texts.filter(({ y }) => y > V2_MAX_TEXT_BASELINE_Y)

      expect(texts.length).toBeGreaterThan(0)
      expect(textoNoMiolo).toEqual([])
    }
  )
})

/**
 * Gera PDFs de amostra dos 5 templates de certificado (layout v2).
 *
 * Uso:
 *   npm run certificate:samples
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  formatDate,
  stampCertificatePdf,
} from '../src/lib/certificate-generator'
import type { CertificateData } from '../src/types/certificate'

interface SampleOrg {
  template: string
  orgao_id: string
  issuingOrganization: string
}

const SAMPLE_ORGS: SampleOrg[] = [
  {
    template: 'juvrio',
    orgao_id: '5300',
    issuingOrganization: 'Secretaria Especial da Juventude Carioca',
  },
  {
    template: 'smpd',
    orgao_id: '4000',
    issuingOrganization: 'Secretaria Municipal da Pessoa com Deficiência',
  },
  {
    template: 'cvlsubtd',
    orgao_id: '52451',
    issuingOrganization: 'Subsecretaria de Cidadania',
  },
  {
    template: 'sesrio',
    orgao_id: '1900',
    issuingOrganization: 'Secretaria de Esporte e Lazer',
  },
  {
    template: 'spmrio',
    orgao_id: '4700',
    issuingOrganization:
      'Secretaria Especial de Políticas para Mulheres e Cuidados',
  },
]

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'lib', 'templates')
const OUTPUT_DIR = path.join(process.cwd(), 'tmp', 'certificate-samples')

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const baseData: Omit<CertificateData, 'issuingOrganization' | 'orgao_id'> = {
    studentName:
      'Maria da Silva Santos Oliveira Maria da Silva Santos Oliveira',
    courseTitle: 'Introdução à Programação Web',
    courseDuration: '40 horas',
    issueDate: formatDate(new Date()),
  }

  for (const org of SAMPLE_ORGS) {
    const templatePath = path.join(TEMPLATES_DIR, `${org.template}.pdf`)
    const templateBytes = new Uint8Array(await fs.readFile(templatePath))

    const data: CertificateData = {
      ...baseData,
      issuingOrganization: org.issuingOrganization,
      orgao_id: org.orgao_id,
    }

    const pdfBytes = await stampCertificatePdf(templateBytes, data, {
      layout: 'v2',
    })

    const outPath = path.join(OUTPUT_DIR, `${org.template}-sample.pdf`)
    await fs.writeFile(outPath, pdfBytes)
    console.log(`✓ ${org.template} → ${outPath}`)
  }

  console.log(`\nSamples gerados em ${OUTPUT_DIR}`)
}

main().catch(error => {
  console.error('Falha ao gerar samples de certificado:', error)
  process.exit(1)
})

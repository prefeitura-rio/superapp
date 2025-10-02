import type {
  CertificateData,
  CertificateGenerationOptions,
} from '@/types/certificate'
import { PDFDocument, type PDFPage, StandardFonts, rgb } from 'pdf-lib'

const TEMPLATE_URL = '/templates/certificate-template.pdf'

/**
 * Carrega o template PDF
 */
async function loadTemplate(): Promise<Uint8Array> {
  try {
    const response = await fetch(TEMPLATE_URL)
    if (!response.ok) {
      throw new Error('Falha ao carregar o template do certificado')
    }
    return new Uint8Array(await response.arrayBuffer())
  } catch (error) {
    console.error('Erro ao carregar template:', error)
    throw new Error('Template de certificado não encontrado')
  }
}

/**
 * Calcula a largura do texto
 */
function getTextWidth(text: string, font: any, fontSize: number): number {
  return font.widthOfTextAtSize(text, fontSize)
}

/**
 * Quebra texto em múltiplas linhas baseado na largura máxima
 */
function wrapText(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = getTextWidth(testLine, font, fontSize)

    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        // Se uma única palavra é maior que maxWidth, adiciona mesmo assim
        lines.push(word)
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Adiciona os textos ao certificado
 */
async function addTextToCertificate(
  page: PDFPage,
  data: CertificateData
): Promise<void> {
  const { width, height } = page.getSize()

  // Carrega as fontes - usando Helvetica como fallback para DM Sans
  const font = await page.doc.embedFont(StandardFonts.Helvetica) // Peso normal (400)
  const mediumFont = await page.doc.embedFont(StandardFonts.HelveticaBold) // Peso 500 (medium)

  // Cores baseadas no design system
  const foreground = rgb(0.035, 0.035, 0.043) // #09090B - cor principal do texto
  const foregroundLight = rgb(0.443, 0.443, 0.482) // #71717B - cor secundária do texto

  // Configurações de posicionamento baseadas no template
  const centerX = width / 2
  const maxTextWidth = 500 // Largura máxima para os textos

  // 1. Nome do órgão (A Prefeitura da Cidade do Rio de Janeiro certifica que)
  page.drawText('A Prefeitura da Cidade do Rio de Janeiro certifica que', {
    x:
      centerX -
      getTextWidth(
        'A Prefeitura da Cidade do Rio de Janeiro certifica que',
        font,
        12
      ) /
        2,
    y: height - 275,
    size: 12,
    font: font,
    color: foregroundLight,
  })

  // 2. Nome do aluno (texto principal) - 36px, peso 500
  const studentNameLines = wrapText(
    data.studentName,
    mediumFont,
    36,
    maxTextWidth
  )
  const studentLineHeight = 40 // Altura da linha baseada no design system
  const studentNameY = height - 335 // Posição Y inicial do nome do aluno

  studentNameLines.forEach((line, index) => {
    page.drawText(line, {
      x: centerX - getTextWidth(line, mediumFont, 36) / 2,
      y: studentNameY - index * studentLineHeight,
      size: 36,
      font: mediumFont,
      color: foreground,
    })
  })

  // Calcula a altura total ocupada pelo nome do aluno
  const studentNameHeight = studentNameLines.length * studentLineHeight

  // 3. Texto do curso - 12px, com título em cor preta, resto em cinza
  const courseTextParts = [
    'participou do curso "',
    data.courseTitle,
    '", com ',
    data.courseDuration,
    ' de duração, sob a coordenação da ',
    data.issuingOrganization,
  ]

  // Quebra o texto completo em linhas considerando a largura máxima
  const fullCourseText = courseTextParts.join('')
  const courseTextLines = wrapText(fullCourseText, font, 12, maxTextWidth)
  const courseLineHeight = 16 // Altura da linha baseada no design system

  // Posição Y do texto do curso baseada na altura real do nome do aluno
  const courseTextY = studentNameY - studentNameHeight - 20 // 20px de espaçamento

  // Para cada linha, desenha o texto com o título em cor preta
  courseTextLines.forEach((line, index) => {
    const lineX = centerX - getTextWidth(line, font, 12) / 2

    // Se a linha contém o título do curso, desenha com formatação mista
    if (line.includes(`"${data.courseTitle}"`)) {
      // Encontra a posição do título na linha
      const beforeTitle = line.substring(
        0,
        line.indexOf(`"${data.courseTitle}"`)
      )
      const title = `"${data.courseTitle}"`
      const afterTitle = line.substring(
        line.indexOf(`"${data.courseTitle}"`) + title.length
      )

      let currentX = lineX

      // Desenha a parte antes do título
      if (beforeTitle) {
        page.drawText(beforeTitle, {
          x: currentX,
          y: courseTextY - index * courseLineHeight,
          size: 12,
          font: font,
          color: foregroundLight,
        })
        currentX += getTextWidth(beforeTitle, font, 12)
      }

      // Desenha o título em cor preta
      page.drawText(title, {
        x: currentX,
        y: courseTextY - index * courseLineHeight,
        size: 12,
        font: font,
        color: foreground,
      })
      currentX += getTextWidth(title, font, 12)

      // Desenha a parte depois do título
      if (afterTitle) {
        page.drawText(afterTitle, {
          x: currentX,
          y: courseTextY - index * courseLineHeight,
          size: 12,
          font: font,
          color: foregroundLight,
        })
      }
    } else {
      // Linha sem o título, desenha normalmente
      page.drawText(line, {
        x: lineX,
        y: courseTextY - index * courseLineHeight,
        size: 12,
        font: font,
        color: foregroundLight,
      })
    }
  })

  // 4. Data e local - 12px, peso normal, cor foregroundLight
  const dateText = `Rio de Janeiro, ${data.issueDate}`
  const dateTextLines = wrapText(dateText, font, 12, maxTextWidth)

  // Calcula a posição Y baseada na altura real do texto do curso
  const courseTextHeight = courseTextLines.length * courseLineHeight
  const dateTextY = courseTextY - courseTextHeight - 20 // 20px de espaçamento

  dateTextLines.forEach((line, index) => {
    page.drawText(line, {
      x: centerX - getTextWidth(line, font, 12) / 2,
      y: dateTextY - index * courseLineHeight,
      size: 12,
      font: font,
      color: foregroundLight,
    })
  })
}

/**
 * Gera um certificado PDF baseado no template
 */
export async function generateCertificate(
  data: CertificateData,
  options: CertificateGenerationOptions = {}
): Promise<Uint8Array> {
  try {
    // Carrega o template PDF
    const templateBytes = await loadTemplate()
    const pdfDoc = await PDFDocument.load(templateBytes)

    // Obtém a primeira página do template
    const pages = pdfDoc.getPages()
    const page = pages[0]

    // Adiciona os textos ao certificado
    await addTextToCertificate(page, data)

    // Gera o PDF final
    const pdfBytes = await pdfDoc.save()

    return pdfBytes
  } catch (error) {
    console.error('Erro ao gerar certificado:', error)
    throw new Error('Falha ao gerar o certificado PDF')
  }
}

/**
 * Gera e faz download do certificado
 */
export async function generateAndDownload(
  data: CertificateData,
  options: CertificateGenerationOptions = {}
): Promise<void> {
  try {
    const pdfBytes = await generateCertificate(data, options)

    // Cria o blob e faz o download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = options.fileName || `${data.courseTitle}-certificado.pdf`
    link.target = '_blank'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Limpa a URL do objeto
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao fazer download do certificado:', error)
    throw error
  }
}

/**
 * Formata a data para o padrão brasileiro
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  return new Intl.DateTimeFormat('pt-BR', options).format(date)
}

/**
 * Formata a duração do curso
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}min de duração`
  }

  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (minutes === 0) {
    return `${wholeHours}h de duração`
  }

  return `${wholeHours}h${minutes}min de duração`
}

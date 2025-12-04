import { getTemplateUrl } from '@/lib/certificate-template-mapping'
import type {
  CertificateData,
  CertificateGenerationOptions,
} from '@/types/certificate'
import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  StandardFonts,
  rgb,
} from 'pdf-lib'

/**
 * Busca o nome do órgão pelo orgao_id através da API route
 * Usado apenas para exibir o nome no certificado (issuingOrganization)
 */
async function getOrganizationName(orgao_id?: string): Promise<string | null> {
  if (!orgao_id) {
    return null
  }

  try {
    const response = await fetch(`/api/departments/${orgao_id}`)
    if (!response.ok) {
      console.error(
        `Erro ao buscar departamento: ${response.status} ${response.statusText}`
      )
      return null
    }

    const data = await response.json()
    return data.nome_ua || null
  } catch (error) {
    console.error('Erro ao buscar nome do órgão:', error)
    return null
  }
}

/**
 * Carrega o template PDF baseado no orgao_id
 */
async function loadTemplate(orgao_id?: string): Promise<Uint8Array> {
  if (!orgao_id) {
    throw new Error('orgao_id é obrigatório para carregar o template')
  }

  const templateUrl = getTemplateUrl(orgao_id)
  if (!templateUrl)
    throw new Error(`Template não encontrado para orgao_id: ${orgao_id}`)
  const res = await fetch(templateUrl)
  if (!res.ok)
    throw new Error(
      `Falha ao carregar o template do certificado: ${templateUrl}`
    )
  return new Uint8Array(await res.arrayBuffer())
}

/** Largura do texto para a fonte/tamanho dado */
function getTextWidth(text: string, font: PDFFont, fontSize: number): number {
  return font.widthOfTextAtSize(text, fontSize)
}

/** Quebra texto por largura máxima */
function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const w of words) {
    const test = current ? `${current} ${w}` : w
    if (getTextWidth(test, font, fontSize) <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      else lines.push(w) // palavra maior que maxWidth
      current = current ? w : ''
    }
  }
  if (current) lines.push(current)
  return lines
}

/** Desenha várias linhas centralizadas e retorna a altura ocupada */
function drawCenteredLines(
  page: PDFPage,
  lines: string[],
  font: PDFFont,
  size: number,
  lineHeight: number,
  centerX: number,
  startY: number,
  color: ReturnType<typeof rgb>
): number {
  lines.forEach((line, i) => {
    const y = startY - i * lineHeight
    const x = centerX - font.widthOfTextAtSize(line, size) / 2
    page.drawText(line, { x, y, size, font, color })
  })
  return lines.length * lineHeight
}

/** Desenha linha do bloco do curso com o título em cor diferente, mantendo centralização */
function drawCourseLineMixed(
  page: PDFPage,
  line: string,
  centerX: number,
  y: number,
  font: PDFFont,
  size: number,
  colorNormal: ReturnType<typeof rgb>,
  colorTitle: ReturnType<typeof rgb>,
  titleQuoted: string
) {
  const totalWidth = font.widthOfTextAtSize(line, size)
  let x = centerX - totalWidth / 2

  const idx = line.indexOf(titleQuoted)
  if (idx === -1) {
    page.drawText(line, { x, y, size, font, color: colorNormal })
    return
  }

  const before = line.slice(0, idx)
  const title = titleQuoted
  const after = line.slice(idx + title.length)

  if (before) {
    page.drawText(before, { x, y, size, font, color: colorNormal })
    x += font.widthOfTextAtSize(before, size)
  }
  page.drawText(title, { x, y, size, font, color: colorTitle })
  x += font.widthOfTextAtSize(title, size)

  if (after) {
    page.drawText(after, { x, y, size, font, color: colorNormal })
  }
}

type InternalTypography = {
  orgSize: number
  orgLH: number
  nameSize: number
  nameLH: number
  courseSize: number
  courseLH: number
  dateSize: number
  dateLH: number
}

/**
 * Adiciona textos com:
 * - conjunto centralizado verticalmente (e deslocado para cima)
 * - 4 blocos igualmente espaçados (GAP constante)
 * - quebra de linha por largura
 * - título do curso com cor destacada
 */
async function addTextToCertificate(
  page: PDFPage,
  data: CertificateData,
  fonts: { regular: PDFFont; bold: PDFFont },
  opts?: {
    maxTextWidth?: number
    gap?: number
    offsetUp?: number
    typography?: Partial<InternalTypography>
  }
): Promise<void> {
  const { width, height } = page.getSize()
  const centerX = width / 2

  const regular = fonts.regular
  const bold = fonts.bold

  // cores
  const foreground = rgb(0.035, 0.035, 0.043) // #09090B
  const foregroundLight = rgb(0.443, 0.443, 0.482) // #71717B

  // ajustes de layout
  const maxTextWidth = opts?.maxTextWidth ?? 500
  const GAP = opts?.gap ?? 24
  const offsetUp = opts?.offsetUp ?? 40

  // tipografia
  const T: InternalTypography = {
    orgSize: 12,
    orgLH: 16,
    nameSize: 36,
    nameLH: 40,
    courseSize: 12,
    courseLH: 16,
    dateSize: 12,
    dateLH: 16,
    ...(opts?.typography || {}),
  }

  // --- montar linhas de cada bloco ---
  const orgText = 'A Prefeitura da Cidade do Rio de Janeiro certifica que'
  const orgLines = wrapText(orgText, regular, T.orgSize, maxTextWidth)

  // (opcional) reduzir nome se estourar linhas demais
  let nameSize = T.nameSize
  let nameLH = T.nameLH
  let nameLines = wrapText(data.studentName, bold, nameSize, maxTextWidth)
  if (nameLines.length > 2) {
    nameSize = Math.max(28, nameSize - 4)
    nameLH = Math.max(32, nameLH - 4)
    nameLines = wrapText(data.studentName, bold, nameSize, maxTextWidth)
  }

  const courseFull = [
    'participou do curso "',
    data.courseTitle,
    '", com ',
    data.courseDuration,
    ' de duração, sob a coordenação da ',
    data.issuingOrganization,
  ].join('')
  const courseLines = wrapText(courseFull, regular, T.courseSize, maxTextWidth)

  const dateLines = wrapText(
    `Rio de Janeiro, ${data.issueDate}`,
    regular,
    T.dateSize,
    maxTextWidth
  )

  // --- alturas reais ---
  const orgH = Math.max(T.orgLH, orgLines.length * T.orgLH)
  const nameH = Math.max(nameLH, nameLines.length * nameLH)
  const courseH = Math.max(T.courseLH, courseLines.length * T.courseLH)
  const dateH = Math.max(T.dateLH, dateLines.length * T.dateLH)

  const groupHeight = orgH + nameH + courseH + dateH + GAP * 3
  const groupCenterY = height / 2 + offsetUp
  let cursorY = groupCenterY + groupHeight / 2

  // --- BLOCO 1: Órgão ---
  cursorY -= T.orgLH
  drawCenteredLines(
    page,
    orgLines,
    regular,
    T.orgSize,
    T.orgLH,
    centerX,
    cursorY,
    foregroundLight
  )
  cursorY -= orgH - T.orgLH
  cursorY -= GAP

  // --- BLOCO 2: Nome ---
  cursorY -= nameLH
  drawCenteredLines(
    page,
    nameLines,
    bold,
    nameSize,
    nameLH,
    centerX,
    cursorY,
    foreground
  )
  cursorY -= nameH - nameLH
  cursorY -= GAP

  // --- BLOCO 3: Curso (misto de cores para o título) ---
  cursorY -= T.courseLH
  const quoted = `"${data.courseTitle}"`
  courseLines.forEach((line, i) => {
    const y = cursorY - i * T.courseLH
    drawCourseLineMixed(
      page,
      line,
      centerX,
      y,
      regular,
      T.courseSize,
      foregroundLight,
      foreground,
      quoted
    )
  })
  cursorY -= courseH - T.courseLH
  cursorY -= GAP

  // --- BLOCO 4: Data/Local ---
  cursorY -= T.dateLH
  drawCenteredLines(
    page,
    dateLines,
    regular,
    T.dateSize,
    T.dateLH,
    centerX,
    cursorY,
    foregroundLight
  )
}

/**
 * Gera um certificado PDF baseado no template da organização
 */
export async function generateCertificate(
  data: CertificateData,
  options: CertificateGenerationOptions & {
    maxTextWidth?: number
    gap?: number
    offsetUp?: number
    typography?: Partial<InternalTypography>
  } = {}
): Promise<Uint8Array> {
  // Valida se orgao_id foi fornecido
  if (!data.orgao_id) {
    throw new Error('orgao_id é obrigatório para gerar o certificado')
  }

  // Busca o nome do órgão pelo orgao_id para usar no texto do certificado
  // (sempre busca se não tiver um nome válido ou se for o fallback padrão)
  const hasValidOrganization =
    data.issuingOrganization &&
    data.issuingOrganization !== 'Organização não informada' &&
    data.issuingOrganization.trim() !== ''

  if (!hasValidOrganization) {
    const organizationName = await getOrganizationName(data.orgao_id)
    if (organizationName) {
      data.issuingOrganization = organizationName
    } else {
      // Se não conseguir buscar, mantém o valor original ou usa um fallback
      data.issuingOrganization =
        data.issuingOrganization || 'Organização não informada'
    }
  }

  // Carrega o template usando o orgao_id diretamente
  const templateBytes = await loadTemplate(data.orgao_id)
  const pdfDoc = await PDFDocument.load(templateBytes)

  // embute fontes no DOC
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const page = pdfDoc.getPages()[0]

  await addTextToCertificate(
    page,
    data,
    { regular, bold },
    {
      maxTextWidth: options.maxTextWidth,
      gap: options.gap,
      offsetUp: options.offsetUp,
      typography: options.typography,
    }
  )

  return await pdfDoc.save()
}

/** Gera e baixa o arquivo no browser */
export async function generateAndDownload(
  data: CertificateData,
  options: CertificateGenerationOptions & {
    fileName?: string
    maxTextWidth?: number
    gap?: number
    offsetUp?: number
    typography?: Partial<InternalTypography>
  } = {}
): Promise<void> {
  const pdfBytes = await generateCertificate(data, options)
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = options.fileName || `${data.courseTitle}-certificado.pdf`
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Formata data pt-BR (“1 de outubro de 2025”) */
export function formatDate(date: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  return new Intl.DateTimeFormat('pt-BR', opts).format(date)
}

/** Formata duração em horas/minutos (ex.: “2h30min de duração”) */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}min de duração`
  }
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  return minutes === 0
    ? `${whole}h de duração`
    : `${whole}h${minutes}min de duração`
}

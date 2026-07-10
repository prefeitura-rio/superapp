import {
  getCertificateTemplate,
  getTemplateUrl,
  usesNewCertificateLayout,
} from '@/lib/certificate-template-mapping'
import type {
  CertificateData,
  CertificateGenerationOptions,
} from '@/types/certificate'
import fontkit from '@pdf-lib/fontkit'
import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  StandardFonts,
  rgb,
} from 'pdf-lib'

const MONTSERRAT_REGULAR_PATH = '/fonts/montserrat/Montserrat-Regular.ttf'
const MONTSERRAT_BOLD_PATH = '/fonts/montserrat/Montserrat-Bold.ttf'

/** Carrega bytes de fonte de /public (browser via fetch, Node via fs) */
async function loadFontBytes(publicPath: string): Promise<Uint8Array> {
  if (typeof window === 'undefined') {
    const { promises: fs } = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.join(
      process.cwd(),
      'public',
      publicPath.replace(/^\//, '')
    )
    return new Uint8Array(await fs.readFile(filePath))
  }

  const res = await fetch(publicPath)
  if (!res.ok) {
    throw new Error(`Falha ao carregar fonte: ${publicPath}`)
  }
  return new Uint8Array(await res.arrayBuffer())
}

async function embedMontserratFonts(
  pdfDoc: PDFDocument
): Promise<{ regular: PDFFont; bold: PDFFont }> {
  pdfDoc.registerFontkit(fontkit)
  const [regularBytes, boldBytes] = await Promise.all([
    loadFontBytes(MONTSERRAT_REGULAR_PATH),
    loadFontBytes(MONTSERRAT_BOLD_PATH),
  ])
  const regular = await pdfDoc.embedFont(regularBytes)
  const bold = await pdfDoc.embedFont(boldBytes)
  return { regular, bold }
}

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
 * Layout legado: textos centralizados (smac).
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

// --- Layout v2 (banner lateral + texto alinhado à esquerda) ---

const COLOR_BLACK = rgb(0, 0, 0)
const COLOR_GRAY = rgb(0x66 / 255, 0x66 / 255, 0x66 / 255) // #666666
const COLOR_BLUE = rgb(0x37 / 255, 0x57 / 255, 0xbe / 255) // #3757be

interface TextRun {
  text: string
  size: number
  color: ReturnType<typeof rgb>
  font: PDFFont
}

/** Quebra runs mistos em linhas respeitando maxWidth */
function wrapMixedRuns(runs: TextRun[], maxWidth: number): TextRun[][] {
  const lines: TextRun[][] = []
  let currentLine: TextRun[] = []
  let currentWidth = 0

  function pushRun(run: TextRun) {
    const width = getTextWidth(run.text, run.font, run.size)
    if (currentWidth + width <= maxWidth || currentLine.length === 0) {
      currentLine.push(run)
      currentWidth += width
      return
    }
    lines.push(currentLine)
    currentLine = [run]
    currentWidth = width
  }

  for (const run of runs) {
    const words = run.text.split(/(\s+)/)
    for (const word of words) {
      if (!word) continue
      pushRun({ ...run, text: word })
    }
  }

  if (currentLine.length > 0) lines.push(currentLine)
  return lines
}

/** Desenha linhas de runs mistos alinhadas à esquerda; retorna Y final (abaixo da última linha) */
function drawMixedRunLines(
  page: PDFPage,
  lines: TextRun[][],
  startX: number,
  startY: number,
  lineHeight: number
): number {
  let y = startY
  for (const line of lines) {
    let x = startX
    for (const run of line) {
      if (!run.text) continue
      page.drawText(run.text, {
        x,
        y,
        size: run.size,
        font: run.font,
        color: run.color,
      })
      x += getTextWidth(run.text, run.font, run.size)
    }
    y -= lineHeight
  }
  return y
}

/**
 * Layout v2: título + texto alinhado à esquerda na área branca
 * (juvrio, planetario, smpd, cvlsubtd, sesrio, spmrio).
 */
function addTextLayoutV2(
  page: PDFPage,
  data: CertificateData,
  fonts: { regular: PDFFont; bold: PDFFont }
): void {
  const bold = fonts.bold

  // Área de conteúdo alinhada com a primeira assinatura (à direita do banner)
  const contentX = 265
  const maxTextWidth = 500
  const gap = 22

  let cursorY = 490

  // --- Título ---
  page.drawText('Certificado', {
    x: contentX,
    y: cursorY,
    size: 35,
    font: bold,
    color: COLOR_BLACK,
  })
  // "de conclusão" bem junto de "Certificado"
  cursorY -= 20
  page.drawText('de conclusão', {
    x: contentX,
    y: cursorY,
    size: 15,
    font: bold,
    color: COLOR_GRAY,
  })
  // Afastar o bloco de intro (~3x a distância anterior de gap+8 ≈ 30)
  cursorY -= 50

  // --- Intro mista ---
  const introRuns: TextRun[] = [
    { text: 'A ', size: 14, color: COLOR_GRAY, font: bold },
    {
      text: 'Prefeitura da Cidade do Rio de Janeiro',
      size: 16,
      color: COLOR_BLACK,
      font: bold,
    },
    { text: ' certifica que', size: 14, color: COLOR_GRAY, font: bold },
  ]
  const introLines = wrapMixedRuns(introRuns, maxTextWidth)
  cursorY = drawMixedRunLines(page, introLines, contentX, cursorY, 20)
  // Nome bem próximo da linha "certifica que"
  cursorY -= 8

  // --- Nome (UPPERCASE, máx. 2 linhas) ---
  const studentName = data.studentName.toUpperCase()
  let nameSize = 21
  let nameLH = 26
  let nameLines = wrapText(studentName, bold, nameSize, maxTextWidth)
  if (nameLines.length > 2) {
    nameSize = Math.max(16, nameSize - 3)
    nameLH = Math.max(20, nameLH - 3)
    nameLines = wrapText(studentName, bold, nameSize, maxTextWidth)
  }
  // Limita a 2 linhas mesmo após redução
  nameLines = nameLines.slice(0, 2)
  // Mais espaço entre linhas quando o nome quebra em 2
  if (nameLines.length === 2) nameLH = Math.max(nameLH, 32)
  for (const line of nameLines) {
    page.drawText(line, {
      x: contentX,
      y: cursorY,
      size: nameSize,
      font: bold,
      color: COLOR_BLACK,
    })
    cursorY -= nameLH
  }
  // Capacitação mais próxima do nome (sobe o bloco de baixo)
  cursorY -= 8

  // --- Capacitação (fixo cinza + dinâmicos azuis) ---
  const courseRuns: TextRun[] = [
    {
      text: 'participou da capacitação em ',
      size: 14,
      color: COLOR_GRAY,
      font: bold,
    },
    {
      text: data.courseTitle,
      size: 16,
      color: COLOR_BLUE,
      font: bold,
    },
    { text: ', com ', size: 14, color: COLOR_GRAY, font: bold },
    {
      text: data.courseDuration,
      size: 16,
      color: COLOR_BLUE,
      font: bold,
    },
    {
      text: ' de duração sob a coordenação da ',
      size: 14,
      color: COLOR_GRAY,
      font: bold,
    },
    {
      text: data.issuingOrganization,
      size: 16,
      color: COLOR_BLUE,
      font: bold,
    },
    {
      text: ' da Cidade do Rio de Janeiro',
      size: 14,
      color: COLOR_GRAY,
      font: bold,
    },
  ]
  const courseLines = wrapMixedRuns(courseRuns, maxTextWidth)
  cursorY = drawMixedRunLines(page, courseLines, contentX, cursorY, 28)
  cursorY -= gap

  // --- Data ---
  const dateRuns: TextRun[] = [
    { text: 'Rio de Janeiro, ', size: 14, color: COLOR_GRAY, font: bold },
    {
      text: data.issueDate,
      size: 16,
      color: COLOR_BLUE,
      font: bold,
    },
  ]
  drawMixedRunLines(
    page,
    wrapMixedRuns(dateRuns, maxTextWidth),
    contentX,
    cursorY,
    20
  )
}

/**
 * Estampa os dados do certificado sobre bytes de um template PDF.
 * Útil para scripts locais (sem fetch da API de templates).
 */
export async function stampCertificatePdf(
  templateBytes: Uint8Array,
  data: CertificateData,
  options: {
    layout?: 'v2' | 'legacy'
    maxTextWidth?: number
    gap?: number
    offsetUp?: number
    typography?: Partial<InternalTypography>
  } = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes)
  const page = pdfDoc.getPages()[0]

  const layout =
    options.layout ??
    (data.orgao_id
      ? (() => {
          const template = getCertificateTemplate(data.orgao_id)
          return template && usesNewCertificateLayout(template)
            ? 'v2'
            : 'legacy'
        })()
      : 'v2')

  if (layout === 'v2') {
    const fonts = await embedMontserratFonts(pdfDoc)
    addTextLayoutV2(page, data, fonts)
  } else {
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
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
  }

  return await pdfDoc.save()
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

  const templateBytes = await loadTemplate(data.orgao_id)
  return stampCertificatePdf(templateBytes, data, options)
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

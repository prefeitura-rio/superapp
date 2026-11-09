import path from 'node:path'
import { Font, StyleSheet } from '@react-pdf/renderer'

/**
 * Fontes e estilos do PDF da Carta de Serviços (A4, Figma "PrefRio › Carta de serviços
 * › PDF"). Cores espelham os tokens de `src/app/globals.css`; o react-pdf não lê CSS.
 */

export const FONT_FAMILY = 'DM Sans'

/*
 * DM Sans (OFL), subset latin do @fontsource/dm-sans 5.3.0. Os TTF são conversão sem
 * perda dos WOFF do pacote (mesmas tabelas, só descomprimidas).
 */

const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'dm-sans')
const font = (file: string) => path.join(fontsDir, file)

let fontsRegistered = false

export function registerCartaPdfFonts() {
  if (fontsRegistered) return
  Font.register({
    family: FONT_FAMILY,
    fonts: [
      { src: font('dm-sans-latin-400-normal.ttf'), fontWeight: 400 },
      {
        src: font('dm-sans-latin-400-italic.ttf'),
        fontWeight: 400,
        fontStyle: 'italic',
      },
      { src: font('dm-sans-latin-500-normal.ttf'), fontWeight: 500 },
      { src: font('dm-sans-latin-700-normal.ttf'), fontWeight: 700 },
      {
        src: font('dm-sans-latin-700-italic.ttf'),
        fontWeight: 700,
        fontStyle: 'italic',
      },
    ],
  })
  // Sem hifenização automática: em português o react-pdf quebraria palavras errado.
  Font.registerHyphenationCallback(word => [word])
  fontsRegistered = true
}

export const colors = {
  foreground: '#09090b',
  foregroundLight: '#67676f',
  primary: '#13335a',
  /** Azul do título da capa (Figma). */
  accent: '#3a5bd9',
  border: '#e4e4e7',
  link: '#1d4ed8',
}

export const PAGE_PADDING_X = 48
export const PAGE_PADDING_TOP = 88
export const PAGE_PADDING_BOTTOM = 64

export const cartaPdfStyles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 9.5,
    lineHeight: 1.45,
    color: colors.foreground,
    paddingTop: PAGE_PADDING_TOP,
    paddingBottom: PAGE_PADDING_BOTTOM,
    paddingHorizontal: PAGE_PADDING_X,
  },

  // ── cabeçalho / rodapé fixos ───────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 28,
    right: PAGE_PADDING_X,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footer: {
    position: 'absolute',
    left: PAGE_PADDING_X,
    right: PAGE_PADDING_X,
    bottom: 28,
    fontSize: 7,
    color: colors.foregroundLight,
  },
  footerRule: {
    height: 0.75,
    backgroundColor: colors.border,
    marginBottom: 6,
  },

  // ── capa ───────────────────────────────────────────────────────────────────
  coverPage: { justifyContent: 'center' },
  coverWaves: { position: 'absolute', top: 0, left: 0 },
  coverTitle: {
    fontSize: 34,
    lineHeight: 1.15,
    fontWeight: 500,
    color: colors.accent,
  },
  coverSubtitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 500,
    color: colors.accent,
  },

  // ── títulos de seção ───────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 400,
    marginBottom: 18,
  },

  // ── índice ─────────────────────────────────────────────────────────────────
  indexGroupTitle: { fontWeight: 700, marginBottom: 6 },
  indexItem: {
    marginBottom: 3,
    color: colors.foreground,
    textDecoration: 'none',
  },

  // ── apresentação ───────────────────────────────────────────────────────────
  presentationParagraph: { marginBottom: 10, fontSize: 10.5, lineHeight: 1.55 },

  // ── catálogo ───────────────────────────────────────────────────────────────
  // Separador como View de 0.75pt (fica entre os serviços, não dentro do bloco que quebra).
  service: { paddingBottom: 18 },
  divider: { height: 0.75, backgroundColor: colors.border, marginBottom: 18 },
  serviceTitle: { fontSize: 15, lineHeight: 1.25, fontWeight: 700 },
  serviceDates: {
    marginTop: 3,
    marginBottom: 12,
    fontSize: 8.5,
    color: colors.foregroundLight,
  },
  block: { marginBottom: 10 },
  blockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  blockLabel: { fontWeight: 700 },
  columns: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  column: { flex: 1 },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 8,
  },
  muted: { color: colors.foregroundLight },
  channelItem: { marginBottom: 3 },

  // ── HTML convertido ────────────────────────────────────────────────────────
  paragraph: { marginBottom: 4 },
  htmlHeading: { fontWeight: 700, marginTop: 4, marginBottom: 2 },
  list: { marginBottom: 4 },
  listItem: { flexDirection: 'row', marginBottom: 1 },
  listMarker: { width: 12 },
  listContent: { flex: 1 },
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  underline: { textDecoration: 'underline' },
  link: { color: colors.link, textDecoration: 'underline' },
  inheritLink: { color: colors.foreground, textDecoration: 'none' },
})

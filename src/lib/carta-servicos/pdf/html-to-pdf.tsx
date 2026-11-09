import { Link, Text, View } from '@react-pdf/renderer'
import { JSDOM } from 'jsdom'
import type { ReactNode } from 'react'
import { displayUrl } from './carta-pdf-content'
import { cartaPdfStyles as s } from './styles'

/**
 * Converte o HTML rico da Carta (Salesforce Knowledge) em primitivas do react-pdf.
 *
 * Não é um renderizador HTML: cobre só o que o CMS produz (p, h1–h6, strong/b,
 * em/i, u, a, br, ul/ol/li). Tag desconhecida vira o texto dos filhos; script, style
 * e afins são descartados. Nada é executado: o DOM do jsdom só é lido.
 */

const BLOCK_TAGS = new Set([
  'p',
  'div',
  'section',
  'article',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'table',
  'tbody',
  'thead',
  'tr',
])
const DROP_TAGS = new Set([
  'script',
  'style',
  'noscript',
  'iframe',
  'object',
  'template',
  'img',
  'svg',
])
const ELEMENT_NODE = 1
const TEXT_NODE = 3

let templateDocument: Document | null = null

function parseFragment(html: string): Node {
  const doc =
    templateDocument ??
    new JSDOM('<!doctype html><body></body>').window.document
  templateDocument = doc
  const template = doc.createElement('template')
  template.innerHTML = html
  return template.content
}

function isBlock(node: Node): boolean {
  return (
    node.nodeType === ELEMENT_NODE &&
    BLOCK_TAGS.has((node as Element).tagName.toLowerCase())
  )
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ')
}

/** Texto visível de um link vs. URL: no papel o link some, então a URL vai junto. */
function linkLabel(text: string, href: string): string | null {
  const clean = text.trim()
  const bareHref = href.replace(/^mailto:|^tel:/, '')
  if (!clean || clean === href || clean === bareHref) return null
  return clean
}

function safeHref(href: string | null): string | null {
  if (!href) return null
  const trimmed = href.trim()
  return /^(https?:|mailto:|tel:)/i.test(trimmed) ? trimmed : null
}

let keySeq = 0
const nextKey = () => `h${keySeq++}`

function renderInline(nodes: Iterable<Node>): ReactNode[] {
  const out: ReactNode[] = []

  for (const node of nodes) {
    if (node.nodeType === TEXT_NODE) {
      const text = collapse(node.textContent ?? '')
      if (text) out.push(text)
      continue
    }
    if (node.nodeType !== ELEMENT_NODE) continue

    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (DROP_TAGS.has(tag)) continue

    const children = renderInline(el.childNodes)

    switch (tag) {
      case 'br':
        out.push('\n')
        break
      case 'strong':
      case 'b':
        out.push(
          <Text key={nextKey()} style={s.bold}>
            {children}
          </Text>
        )
        break
      case 'em':
      case 'i':
        out.push(
          <Text key={nextKey()} style={s.italic}>
            {children}
          </Text>
        )
        break
      case 'u':
        out.push(
          <Text key={nextKey()} style={s.underline}>
            {children}
          </Text>
        )
        break
      case 'a': {
        const href = safeHref(el.getAttribute('href'))
        if (!href) {
          out.push(...children)
          break
        }
        const label = linkLabel(el.textContent ?? '', href)
        out.push(
          <Text key={nextKey()}>
            {label ? (
              <>
                {children} (
                <Link src={href} style={s.link}>
                  {displayUrl(href)}
                </Link>
                )
              </>
            ) : (
              <Link src={href} style={s.link}>
                {displayUrl(href)}
              </Link>
            )}
          </Text>
        )
        break
      }
      default:
        out.push(...children)
    }
  }

  return out
}

function hasVisibleText(nodes: ReactNode[]): boolean {
  return nodes.some(node =>
    typeof node === 'string' ? node.trim().length > 0 : node !== null
  )
}

/** Agrupa nós inline consecutivos em parágrafos e renderiza os blocos. */
function renderBlocks(nodes: Iterable<Node>, depth: number): ReactNode[] {
  const out: ReactNode[] = []
  let inlineRun: Node[] = []

  const flush = () => {
    if (inlineRun.length === 0) return
    const inline = renderInline(inlineRun)
    inlineRun = []
    if (!hasVisibleText(inline)) return
    out.push(
      <Text key={nextKey()} style={s.paragraph}>
        {inline}
      </Text>
    )
  }

  for (const node of nodes) {
    if (!isBlock(node)) {
      if (
        node.nodeType === ELEMENT_NODE &&
        DROP_TAGS.has((node as Element).tagName.toLowerCase())
      ) {
        continue
      }
      inlineRun.push(node)
      continue
    }

    flush()
    const el = node as Element
    const tag = el.tagName.toLowerCase()

    if (/^h[1-6]$/.test(tag)) {
      const inline = renderInline(el.childNodes)
      if (hasVisibleText(inline)) {
        out.push(
          <Text key={nextKey()} style={s.htmlHeading}>
            {inline}
          </Text>
        )
      }
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.children).filter(
        child => child.tagName.toLowerCase() === 'li'
      )
      if (items.length === 0) continue
      out.push(
        <View key={nextKey()} style={[s.list, { marginLeft: depth * 12 }]}>
          {items.map((item, index) => (
            <View key={nextKey()} style={s.listItem}>
              <Text style={s.listMarker}>
                {tag === 'ol' ? `${index + 1}.` : '•'}
              </Text>
              <View style={s.listContent}>
                {renderBlocks(item.childNodes, depth + 1)}
              </View>
            </View>
          ))}
        </View>
      )
      continue
    }

    // p, div, li solto, blockquote, tabela: desce mantendo a ordem.
    if (tag === 'p') {
      const hasNestedBlocks = Array.from(el.childNodes).some(isBlock)
      if (!hasNestedBlocks) {
        const inline = renderInline(el.childNodes)
        if (hasVisibleText(inline)) {
          out.push(
            <Text key={nextKey()} style={s.paragraph}>
              {inline}
            </Text>
          )
        }
        continue
      }
    }

    out.push(...renderBlocks(el.childNodes, depth))
  }

  flush()
  return out
}

/** HTML da Carta → nós react-pdf. Vazio ou só espaços → `[]`. */
export function htmlToPdf(html: string | null | undefined): ReactNode[] {
  if (!html?.trim()) return []
  return renderBlocks(parseFragment(html).childNodes, 0)
}

/** Só o texto, sem marcação (para campos curtos como prazo e custo). */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html?.trim()) return ''
  return collapse(parseFragment(html).textContent ?? '').trim()
}

import fs from 'node:fs'
import path from 'node:path'
import {
  CARTA_PDF_FOOTER_TEXT,
  LEI_13460_PARAGRAPHS,
} from '@/constants/carta-de-servicos'
import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import {
  type CartaOrgUnit,
  formatOrgUnitLabel,
} from '@/lib/carta-servicos/org-units'
import {
  Document,
  Image,
  Link,
  Page,
  Path,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import {
  displayUrl,
  formatServiceDates,
  groupServiceChannels,
  serviceAnchorId,
  splitMarkdownLinks,
  withNotes,
} from './carta-pdf-content'
import { htmlToPdf, htmlToPlainText } from './html-to-pdf'
import { colors, cartaPdfStyles as s } from './styles'

const assetsDir = path.join(process.cwd(), 'public', 'carta-de-servicos')
const PREFEITURA_LOGO = path.join(assetsDir, 'prefeitura-rio.png')
/**
 * Logo da iplanrio. O react-pdf não lê arquivo SVG em `<Image>`, então o PNG é
 * gerado a partir de `iplanrio.svg` (a fonte); ao trocar o SVG, gere o PNG de novo.
 */
const IPLANRIO_LOGO = path.join(assetsDir, 'iplanrio.png')

type Logo = { data: Buffer; format: 'png'; width: number; height: number }

/**
 * Lê o PNG e a proporção do cabeçalho IHDR. Passar bytes (e não o caminho) evita que
 * o react-pdf trate `D:\...` como URL no Windows; o tamanho explícito evita que o
 * `<Image>` colapse para largura 0 dentro do cabeçalho absoluto.
 */
function readLogo(file: string, height: number): Logo | null {
  try {
    const data = fs.readFileSync(file)
    const pxWidth = data.readUInt32BE(16)
    const pxHeight = data.readUInt32BE(20)
    if (!pxWidth || !pxHeight) return null
    return { data, format: 'png', height, width: (pxWidth / pxHeight) * height }
  } catch {
    return null
  }
}

function InstitutionalHeader({ logos }: { logos: Logo[] }) {
  return (
    <View style={s.header} fixed>
      {logos.map(logo => (
        <Image
          key={logo.width}
          src={{ data: logo.data, format: logo.format }}
          style={{ width: logo.width, height: logo.height }}
        />
      ))}
    </View>
  )
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerRule} />
      {/*
       * Sem número de página: o texto dinâmico (`render`) em elemento `fixed` quebra o
       * react-pdf 4.9 a partir da 10ª página ("unsupported number" no pdfkit).
       */}
      <Text>{CARTA_PDF_FOOTER_TEXT}</Text>
    </View>
  )
}

/** Linhas decorativas da capa (Figma), em SVG para não depender de imagem. */
function CoverWaves() {
  const lines = Array.from({ length: 7 }, (_, i) => i)
  return (
    <Svg style={s.coverWaves} width={300} height={130} viewBox="0 0 300 130">
      {lines.map(i => (
        <Path
          key={i}
          d={`M 0 ${18 + i * 9} C 70 ${-10 + i * 6}, 140 ${70 + i * 8}, 300 ${4 + i * 3}`}
          stroke="#9cc3f0"
          strokeWidth={0.6}
          fill="none"
          opacity={0.85 - i * 0.08}
        />
      ))}
    </Svg>
  )
}

function ArrowIcon() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={colors.foreground}
        strokeWidth={2.4}
        fill="none"
      />
    </Svg>
  )
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={s.block}>
      <View style={s.blockLabelRow} minPresenceAhead={30}>
        <ArrowIcon />
        <Text style={s.blockLabel}>{label}</Text>
      </View>
      {children}
    </View>
  )
}

function PlainOrHtml({
  html,
  fallback = '—',
}: { html?: string | null; fallback?: string }) {
  const nodes = htmlToPdf(html)
  if (nodes.length === 0) return <Text style={s.muted}>{fallback}</Text>
  return <>{nodes}</>
}

function ServiceBlock({
  service,
  index,
}: {
  service: ClientsCartaServiceDetail
  index: number
}) {
  const dates = formatServiceDates(service)
  const channelGroups = groupServiceChannels(service)
  const deadline = withNotes(
    htmlToPlainText(service.info?.serviceDeadline),
    htmlToPlainText(service.info?.serviceDeadlineNotes)
  )
  const cost = withNotes(
    htmlToPlainText(service.info?.cost),
    htmlToPlainText(service.info?.costNotes)
  )
  const requiredDocs = (service.howToRequest?.requiredDocs ?? []).flatMap(doc =>
    htmlToPdf(doc)
  )
  const fullDescription = htmlToPdf(service.info?.fullDescription)
  const exclusions = htmlToPdf(service.howToRequest?.exclusions)
  const legislation = [...(service.legislation ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(item => item.titulo?.trim())
    .filter((item): item is string => Boolean(item))

  return (
    <View style={s.service} id={serviceAnchorId(index)}>
      {/* Título nunca fica sozinho no pé da página: vai junto com o "O que é?". */}
      <View wrap={false}>
        <Text style={s.serviceTitle}>{service.name}</Text>
        {dates && <Text style={s.serviceDates}>{dates}</Text>}
        <Block label="O que é?">
          <PlainOrHtml html={service.info?.summary} />
        </Block>
      </View>

      <View style={s.columns}>
        <View style={s.column}>
          <Block label="Resultados obtidos">
            <PlainOrHtml html={service.howToRequest?.serviceResult} />
          </Block>
        </View>
        <View style={s.column}>
          <Block label="Prazo esperado">
            <Text>{deadline ?? '—'}</Text>
          </Block>
        </View>
        <View style={s.column}>
          <Block label="Custo do serviço">
            <Text>{cost ?? (service.info?.isFree ? 'Gratuito' : '—')}</Text>
          </Block>
        </View>
      </View>

      <Block label="Como solicitar">
        {htmlToPdf(service.howToRequest?.instructions)}
        {channelGroups.length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={s.blockLabel}>Canais de atendimento</Text>
            {channelGroups.map((group, groupIndex) => (
              <View key={group.key} style={{ marginTop: 3 }}>
                <Text>
                  {groupIndex + 1}. {group.label}:
                </Text>
                {group.entries.map(entry => (
                  <View
                    key={`${entry.text}-${entry.href ?? ''}`}
                    style={[s.listItem, { marginLeft: 12 }]}
                    wrap={false}
                  >
                    <Text style={s.listMarker}>•</Text>
                    <Text style={s.listContent}>
                      {entry.href && !entry.showUrl ? (
                        <Link src={entry.href} style={s.inheritLink}>
                          {entry.text}
                        </Link>
                      ) : (
                        entry.text
                      )}
                      {entry.href && entry.showUrl ? (
                        <>
                          {': '}
                          <Link src={entry.href} style={s.link}>
                            {displayUrl(entry.href)}
                          </Link>
                        </>
                      ) : null}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </Block>

      {requiredDocs.length > 0 && (
        <Block label="Informações necessárias">{requiredDocs}</Block>
      )}

      {(fullDescription.length > 0 || exclusions.length > 0) && (
        <View>
          <Text style={s.subsectionTitle} minPresenceAhead={40}>
            Descrição do serviço
          </Text>
          {fullDescription}
          {exclusions.length > 0 && (
            <Block label="O que este serviço não cobre">{exclusions}</Block>
          )}
        </View>
      )}

      {legislation.length > 0 && (
        <View>
          <Text style={s.subsectionTitle} minPresenceAhead={30}>
            Legislação relacionada
          </Text>
          {legislation.map(item => (
            <View key={item} style={s.listItem}>
              <Text style={s.listMarker}>•</Text>
              <Text style={s.listContent}>
                {splitMarkdownLinks(item).map((segment, i) =>
                  segment.href ? (
                    <Link key={i} src={segment.href} style={s.link}>
                      {segment.text}
                    </Link>
                  ) : (
                    segment.text
                  )
                )}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

/**
 * O react-pdf quebra um `<Page>` longo relayoutando todo o conteúdo restante a cada
 * página — custo quadrático: 146 serviços num `<Page>` só levavam ~90 s de CPU (e
 * travavam o event loop do Node). Lotes curtos deixam o custo linear; o preço é que
 * cada lote começa em página nova. Medido com a SMFP (146 serviços): 1 → 5,9 s/322
 * págs; 3 → 6,6 s/275; 6 → 7,9 s/263 (contínuo: 91 s/254).
 */
export const CATALOG_SERVICES_PER_PAGE = 6

function chunk<T>(items: T[], size: number): { service: T; index: number }[][] {
  const groups: { service: T; index: number }[][] = []
  items.forEach((service, index) => {
    if (index % size === 0) groups.push([])
    groups[groups.length - 1].push({ service, index })
  })
  return groups
}

export function CartaPdfDocument({
  org,
  services,
  generatedAt = new Date(),
  servicesPerPage = CATALOG_SERVICES_PER_PAGE,
}: {
  org: CartaOrgUnit
  services: ClientsCartaServiceDetail[]
  generatedAt?: Date
  servicesPerPage?: number
}) {
  const logos = [
    readLogo(PREFEITURA_LOGO, 22),
    readLogo(IPLANRIO_LOGO, 16),
  ].filter((logo): logo is Logo => logo !== null)
  const title = `Carta de Serviços ao Usuário – ${formatOrgUnitLabel(org)}`

  return (
    <Document
      title={title}
      author="Prefeitura da Cidade do Rio de Janeiro"
      creator="pref.rio"
      producer="pref.rio"
      subject="Carta de Serviços ao Usuário (Lei Federal nº 13.460/2017)"
      language="pt-BR"
      creationDate={generatedAt}
    >
      {/* 1. Capa */}
      <Page size="A4" style={[s.page, s.coverPage]}>
        <CoverWaves />
        <InstitutionalHeader logos={logos} />
        <Text style={s.coverTitle}>{org.name}</Text>
        {org.shortName && <Text style={s.coverSubtitle}>{org.shortName}</Text>}
        <Footer />
      </Page>

      {/* 2. Índice */}
      <Page size="A4" style={s.page}>
        <InstitutionalHeader logos={logos} />
        <Text style={s.sectionTitle}>Índice</Text>
        <Link src="#apresentacao" style={[s.indexItem, s.indexGroupTitle]}>
          Apresentação da Carta de Serviços
        </Link>
        <Link src="#catalogo" style={[s.indexItem, s.indexGroupTitle]}>
          Catálogo de serviços
        </Link>
        {services.map((service, index) => (
          <Link
            key={service.slug ?? service.articleId ?? index}
            src={`#${serviceAnchorId(index)}`}
            style={[s.indexItem, { marginLeft: 12 }]}
          >
            {service.name}
          </Link>
        ))}
        <Footer />
      </Page>

      {/* 3. Apresentação */}
      <Page size="A4" style={s.page}>
        <InstitutionalHeader logos={logos} />
        <View id="apresentacao">
          <Text style={s.sectionTitle}>Carta de Serviços{'\n'}ao Usuário</Text>
          {LEI_13460_PARAGRAPHS.map(paragraph => (
            <Text key={paragraph} style={s.presentationParagraph}>
              {paragraph}
            </Text>
          ))}
        </View>
        <Footer />
      </Page>

      {/* 4. Catálogo — em lotes de `servicesPerPage`; ver CATALOG_SERVICES_PER_PAGE. */}
      {chunk(services, servicesPerPage).map((group, groupIndex) => (
        <Page
          key={group[0].index}
          size="A4"
          style={s.page}
          wrap
          bookmark={groupIndex === 0 ? 'Catálogo de serviços' : undefined}
        >
          <InstitutionalHeader logos={logos} />
          {groupIndex === 0 && (
            <View id="catalogo">
              <Text style={s.sectionTitle}>Catálogo de serviços</Text>
            </View>
          )}
          {group.map(({ service, index }, i) => (
            <View key={service.slug ?? service.articleId ?? index}>
              {i > 0 && <View style={s.divider} />}
              <ServiceBlock service={service} index={index} />
            </View>
          ))}
          <Footer />
        </Page>
      ))}
    </Document>
  )
}

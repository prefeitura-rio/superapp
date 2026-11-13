import { formatTermosDeUsoLastUpdate } from '@/constants/termos-de-uso/content'
import {
  TERMOS_DE_USO_ROUTE,
  type TermosDeUsoPlatform,
} from '@/constants/termos-de-uso/platforms'
import type {
  TermosDeUsoBlock,
  TermosDeUsoDocument,
  TermosDeUsoSection,
} from '@/constants/termos-de-uso/types'
import { BackLink } from './back-link'
import { BackToOrigin } from './back-to-origin'

interface TermosDeUsoDetailProps {
  platform: TermosDeUsoPlatform
  document: TermosDeUsoDocument
  /** Tela que abriu os termos; sem ela o voltar leva à lista. */
  origin?: { href: string; label: string }
}

/**
 * Detalhe dos Termos de uso, o mesmo para todas as plataformas: o nome vem de
 * `platform` e o texto de `document`. Trocar o texto de uma plataforma é só
 * trocar o conteúdo em `src/constants/termos-de-uso/content`.
 */
export function TermosDeUsoDetail({
  platform,
  document,
  origin,
}: TermosDeUsoDetailProps) {
  return (
    <>
      {origin ? (
        <BackToOrigin href={origin.href} label={origin.label} />
      ) : (
        <BackLink
          href={TERMOS_DE_USO_ROUTE}
          label="Voltar para Termos de uso"
        />
      )}

      <h1 className="mt-6 text-3xl font-medium leading-9 tracking-tight text-foreground">
        Termos de uso: {platform.name}
      </h1>
      <p className="text-sm leading-5 text-foreground-light">
        {formatTermosDeUsoLastUpdate(document)}
      </p>

      <article className="mt-5 flex flex-col gap-8">
        {document.parts.map((part, partIndex) => (
          <div
            key={part.title ?? `parte-${partIndex}`}
            className="flex flex-col gap-7"
          >
            {/* div, não <header>: o único banner da página é o Header Global. */}
            {part.title && (
              <div>
                <h2 className="text-xl font-medium leading-7 text-foreground">
                  {part.title}
                </h2>
                <p className="mt-1 text-sm leading-5 text-foreground-light">
                  {document.updatedAt} - Versão {document.version}
                </p>
              </div>
            )}
            {part.intro && <Blocks blocks={part.intro} />}
            {part.sections.map(section => (
              <Section
                key={section.title}
                section={section}
                headingLevel={part.title ? 'h3' : 'h2'}
              />
            ))}
          </div>
        ))}
      </article>
    </>
  )
}

function Section({
  section,
  headingLevel: Heading,
}: {
  section: TermosDeUsoSection
  headingLevel: 'h2' | 'h3'
}) {
  return (
    <section>
      <Heading className="text-base font-medium leading-6 text-foreground">
        {section.title}
      </Heading>
      <div className="mt-1">
        <Blocks blocks={section.blocks} />
      </div>
    </section>
  )
}

function Blocks({ blocks }: { blocks: TermosDeUsoBlock[] }) {
  return (
    <div className="flex flex-col gap-5 text-sm leading-5 text-foreground-light">
      {blocks.map(block =>
        block.type === 'paragraph' ? (
          <p key={block.text}>{block.text}</p>
        ) : (
          <ul key={block.items[0]}>
            {block.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}

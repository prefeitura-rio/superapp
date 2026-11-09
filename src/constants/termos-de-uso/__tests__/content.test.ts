import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  TERMOS_DE_USO_CONTENT,
  formatTermosDeUsoLastUpdate,
  getTermosDeUsoDocument,
} from '../content'
import { PREF_RIO_V1_PARTS } from '../content/pref-rio-v1'
import { TERMOS_DE_USO_PLATFORMS, type TermosDeUsoSlug } from '../platforms'

describe('termos de uso: estrutura de conteúdo', () => {
  it('tem exatamente uma entrada por plataforma da lista', () => {
    expect(Object.keys(TERMOS_DE_USO_CONTENT).sort()).toEqual(
      TERMOS_DE_USO_PLATFORMS.map(platform => platform.slug).sort()
    )
    // O typecheck também garante: faltar ou sobrar plataforma não compila.
    expectTypeOf<
      keyof typeof TERMOS_DE_USO_CONTENT
    >().toEqualTypeOf<TermosDeUsoSlug>()
  })

  it.each(
    TERMOS_DE_USO_PLATFORMS.map(platform => [platform.name, platform.slug])
  )('%s: texto atual v1.0, de abril de 2026', (_name, slug) => {
    expect(TERMOS_DE_USO_CONTENT[slug]).toMatchObject({
      updatedAt: 'Abril de 2026',
      version: '1.0',
    })
    expect(TERMOS_DE_USO_CONTENT[slug].parts).toBe(PREF_RIO_V1_PARTS)
  })

  it('cada plataforma tem a própria entrada: versão e data mudam sem afetar as outras', () => {
    const entries = Object.values(TERMOS_DE_USO_CONTENT)
    expect(new Set(entries).size).toBe(entries.length)

    const edited = { ...TERMOS_DE_USO_CONTENT }
    edited.cursos = {
      ...edited.cursos,
      version: '2.0',
      updatedAt: 'Maio de 2027',
    }
    expect(edited.empregos).toBe(TERMOS_DE_USO_CONTENT.empregos)
    expect(TERMOS_DE_USO_CONTENT.cursos.version).toBe('1.0')
  })
})

describe('termos de uso: conteúdo por plataforma', () => {
  it.each(
    TERMOS_DE_USO_PLATFORMS.map(platform => [platform.name, platform.slug])
  )('%s tem texto cadastrado', (_name, slug) => {
    const document = getTermosDeUsoDocument(slug)

    expect(document).toBeDefined()
    expect(document?.parts.length).toBeGreaterThan(0)
  })

  it('slug desconhecido (inclusive nomes herdados de Object) não tem texto', () => {
    expect(getTermosDeUsoDocument('ouvidoria')).toBeUndefined()
    expect(getTermosDeUsoDocument('constructor')).toBeUndefined()
    expect(getTermosDeUsoDocument('__proto__')).toBeUndefined()
  })

  it('monta o subtítulo com data e versão do próprio documento', () => {
    const document = getTermosDeUsoDocument('prefrio-site')
    if (!document) throw new Error('sem documento')

    expect(formatTermosDeUsoLastUpdate(document)).toBe(
      'Última atualização: Abril de 2026 - Versão 1.0'
    )
    expect(
      formatTermosDeUsoLastUpdate({
        ...document,
        updatedAt: 'Maio de 2027',
        version: '2.1',
      })
    ).toBe('Última atualização: Maio de 2027 - Versão 2.1')
  })

  it('as seções de cada parte são numeradas em sequência, a partir de 1', () => {
    for (const { slug } of TERMOS_DE_USO_PLATFORMS) {
      for (const part of getTermosDeUsoDocument(slug)?.parts ?? []) {
        const numbers = part.sections.map(section =>
          Number(section.title.match(/^(\d+)\. /)?.[1])
        )
        expect(numbers).toEqual(numbers.map((_, index) => index + 1))
      }
    }
  })

  it('nenhuma seção ou lista fica vazia', () => {
    for (const { slug } of TERMOS_DE_USO_PLATFORMS) {
      for (const part of getTermosDeUsoDocument(slug)?.parts ?? []) {
        for (const section of part.sections) {
          expect(section.blocks.length).toBeGreaterThan(0)
          for (const block of section.blocks) {
            if (block.type === 'paragraph')
              expect(block.text.trim()).not.toBe('')
            else expect(block.items.length).toBeGreaterThan(0)
          }
        }
      }
    }
  })
})

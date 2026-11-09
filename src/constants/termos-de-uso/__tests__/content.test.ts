import { describe, expect, it } from 'vitest'
import { formatTermosDeUsoLastUpdate, getTermosDeUsoDocument } from '../content'
import { TERMOS_DE_USO_PLATFORMS } from '../platforms'

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

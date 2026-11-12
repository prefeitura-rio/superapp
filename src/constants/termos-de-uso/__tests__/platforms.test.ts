import { describe, expect, it } from 'vitest'
import {
  TERMOS_DE_USO_PLATFORMS,
  buildTermosDeUsoHref,
  filterTermosDeUsoPlatforms,
} from '../platforms'

function names(query: string) {
  return filterTermosDeUsoPlatforms(TERMOS_DE_USO_PLATFORMS, query).map(
    platform => platform.name
  )
}

describe('termos de uso: plataformas', () => {
  it('tem slugs únicos e seguros para URL', () => {
    const slugs = TERMOS_DE_USO_PLATFORMS.map(platform => platform.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('monta o link do detalhe', () => {
    expect(buildTermosDeUsoHref('cursos')).toBe('/termos-de-uso/cursos')
  })

  it('busca vazia ou só com espaços devolve todas, na ordem', () => {
    expect(names('')).toHaveLength(5)
    expect(names('   ')).toEqual(names(''))
  })

  it('ignora caixa, acento e espaços nas pontas', () => {
    expect(names('  whatsapp ')).toEqual(['PrefRio Whatsapp'])
    expect(names('Telefônica')).toEqual(['PrefRio Central Telefonica'])
    expect(names('EMPREGO')).toEqual(['Empregos'])
  })

  it('não muta a lista original', () => {
    const result = filterTermosDeUsoPlatforms(TERMOS_DE_USO_PLATFORMS, '')
    expect(result).not.toBe(TERMOS_DE_USO_PLATFORMS)
  })
})

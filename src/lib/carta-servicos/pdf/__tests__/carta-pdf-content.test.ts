// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  displayUrl,
  formatCartaDate,
  formatServiceDates,
  groupServiceChannels,
  splitMarkdownLinks,
  withNotes,
} from '../carta-pdf-content'

describe('formatCartaDate', () => {
  it('formata em pt-BR no fuso de Brasília', () => {
    // 02:00Z ainda é dia 13 em Brasília
    expect(formatCartaDate('2026-10-14T02:00:00.000Z')).toBe(
      '13 de outubro de 2026'
    )
  })

  it('inválido ou vazio vira null', () => {
    expect(formatCartaDate('x')).toBeNull()
    expect(formatCartaDate(undefined)).toBeNull()
  })
})

describe('formatServiceDates', () => {
  it('junta publicação e modificação', () => {
    expect(
      formatServiceDates({
        lastPublishedDate: '2025-01-31T15:00:00Z',
        lastModifiedDate: '2026-03-10T15:00:00Z',
      })
    ).toBe(
      'Publicado em 31 de janeiro de 2025 – Modificado em 10 de março de 2026'
    )
  })
})

describe('groupServiceChannels', () => {
  it('agrupa na ordem on-line, WhatsApp, telefone, presencial', () => {
    const groups = groupServiceChannels({
      buttons: [
        {
          title: 'Acessar serviço',
          url: 'https://a.rio',
          enabled: true,
          order: 1,
        },
        { title: 'Desligado', url: 'https://b.rio', enabled: false },
      ],
      channels: [
        {
          type: 'Presencial',
          titulo: 'Agência 1746',
          endereco: 'Rua Afonso Cavalcanti, 455',
          enabled: true,
        },
        { type: 'Telefone', value: '1746', enabled: true },
        {
          type: 'Digital',
          channelType: 'WhatsApp',
          whatsappLink: 'https://wa.me/552134601746',
          enabled: true,
        },
        {
          type: 'Digital',
          channelType: 'E-mail',
          value: 'contato@prefeitura.rio',
          enabled: true,
        },
        { type: 'Digital', channelType: 'Site', value: '', enabled: false },
      ],
    })

    expect(groups.map(group => group.key)).toEqual([
      'online',
      'whatsapp',
      'telefone',
      'presencial',
    ])
    expect(groups[0].entries).toEqual([
      { text: 'Acessar serviço', href: 'https://a.rio', showUrl: true },
      {
        text: 'E-mail: contato@prefeitura.rio',
        href: 'mailto:contato@prefeitura.rio',
        showUrl: false,
      },
    ])
    expect(groups[2].entries[0]).toEqual({
      text: '1746',
      href: 'tel:1746',
      showUrl: false,
    })
    expect(groups[3].entries[0].text).toBe(
      'Agência 1746 – Rua Afonso Cavalcanti, 455'
    )
  })

  it('sem canais, nenhum grupo', () => {
    expect(groupServiceChannels({})).toEqual([])
  })
})

describe('withNotes', () => {
  it('anexa observação entre parênteses', () => {
    expect(withNotes('10 dias úteis', 'após o protocolo')).toBe(
      '10 dias úteis (após o protocolo)'
    )
    expect(withNotes('', 'só nota')).toBe('só nota')
    expect(withNotes(null, null)).toBeNull()
  })
})

describe('displayUrl', () => {
  it('tira protocolo e www', () => {
    expect(displayUrl('https://www.sei.rio/guia/')).toBe('sei.rio/guia')
  })

  it('corta URL longa com reticências', () => {
    const long = `https://jeap.rio.gov.br/REF/openform.do?${'x'.repeat(300)}`
    const shown = displayUrl(long)
    expect(shown.length).toBe(64)
    expect(shown.endsWith('…')).toBe(true)
  })

  it('decodifica percent-encoding para o texto ficar legível', () => {
    expect(
      displayUrl(
        'https://www.1746.rio/hc/pt-br/articles/123-Solicita%C3%A7%C3%A3o'
      )
    ).toBe('1746.rio/hc/pt-br/articles/123-Solicitação')
    expect(displayUrl('https://wa.me/552100000000?text=Ol%C3%A1!%20Oi')).toBe(
      'wa.me/552100000000?text=Olá! Oi'
    )
  })

  it('corta depois de decodificar, sem sobrar escape pela metade', () => {
    const href = `https://www.1746.rio/hc/pt-br/articles/10733579762971-Informa%C3%A7%C3%B5es-sobre-${'a'.repeat(40)}`
    const shown = displayUrl(href)
    expect(shown).toContain('Informações')
    expect(shown).not.toContain('%')
    expect(Array.from(shown).length).toBe(64)
    expect(shown.endsWith('…')).toBe(true)
  })

  it('não parte caractere fora do BMP no corte', () => {
    const shown = displayUrl(`https://x.rio/${'a'.repeat(61)}%F0%9F%98%80bbb`)
    expect(shown).toBe(`x.rio/${'a'.repeat(57)}…`)
    const emoji = displayUrl(`https://x.rio/${'a'.repeat(56)}%F0%9F%98%80bbb`)
    expect(emoji).toBe(`x.rio/${'a'.repeat(56)}😀…`)
  })

  it('escape malformado mantém o valor original', () => {
    expect(displayUrl('https://sei.rio/busca?q=100%')).toBe(
      'sei.rio/busca?q=100%'
    )
    expect(displayUrl('https://sei.rio/a%E0%A4%A')).toBe('sei.rio/a%E0%A4%A')
  })
})

describe('splitMarkdownLinks', () => {
  it('separa link markdown do texto', () => {
    expect(
      splitMarkdownLinks(
        'Ver [Lei nº 691/1984](https://rio.rj.gov.br/x) e decreto'
      )
    ).toEqual([
      { text: 'Ver ' },
      { text: 'Lei nº 691/1984', href: 'https://rio.rj.gov.br/x' },
      { text: ' e decreto' },
    ])
  })

  it('sem link, um trecho só; protocolo estranho vira texto', () => {
    expect(splitMarkdownLinks('Decreto nº 41.827/2016')).toEqual([
      { text: 'Decreto nº 41.827/2016' },
    ])
    expect(
      splitMarkdownLinks('[x](javascript:alert(1))')[0].href
    ).toBeUndefined()
  })
})

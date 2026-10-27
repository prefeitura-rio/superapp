import { describe, expect, test } from 'vitest'
import { parseMarkdownToHtml } from '../markdown-serializer'

describe('parseMarkdownToHtml links', () => {
  test('mantém link https', () => {
    const html = parseMarkdownToHtml('[site](https://pref.rio/servicos)')

    expect(html).toContain('<a href="https://pref.rio/servicos">site</a>')
  })

  test('escapa caracteres do href', () => {
    const html = parseMarkdownToHtml('[site](https://pref.rio/busca?a=1&b=2)')

    expect(html).toContain(
      '<a href="https://pref.rio/busca?a=1&amp;b=2">site</a>'
    )
  })

  test('mantém mailto, tel, caminho relativo e âncora', () => {
    expect(parseMarkdownToHtml('[e](mailto:a@pref.rio)')).toContain(
      'href="mailto:a@pref.rio"'
    )
    expect(parseMarkdownToHtml('[t](tel:+5521999999999)')).toContain(
      'href="tel:+5521999999999"'
    )
    expect(parseMarkdownToHtml('[p](/servicos/cursos)')).toContain(
      'href="/servicos/cursos"'
    )
    expect(parseMarkdownToHtml('[a](#secao)')).toContain('href="#secao"')
  })

  test('não emite href javascript:', () => {
    const html = parseMarkdownToHtml('[x](javascript:alert(1))')

    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<a ')
    expect(html).toContain('x')
  })

  test('não emite href data:', () => {
    const html = parseMarkdownToHtml('[x](data:text/html,hi)')

    expect(html).not.toContain('data:')
    expect(html).not.toContain('<a ')
    expect(html).toContain('x')
  })

  test('não emite href que quebra o atributo', () => {
    const html = parseMarkdownToHtml('[x](https://ok.com" onclick="alert(1))')

    expect(html).not.toContain('onclick')
    expect(html).not.toContain('<a ')
    expect(html).toContain('x')
  })

  test('não emite href protocol-relative', () => {
    const html = parseMarkdownToHtml('[x](//evil.example/phish)')

    expect(html).not.toContain('evil.example')
    expect(html).not.toContain('<a ')
  })
})

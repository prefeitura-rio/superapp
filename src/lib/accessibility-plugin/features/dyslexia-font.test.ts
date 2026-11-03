import { afterEach, describe, expect, it } from 'vitest'
import { DyslexiaFont } from './dyslexia-font'

const FONT_FACE_ID = 'a11y-opendyslexic-face'
const EXPECTED_FONT_URL =
  'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/otf/OpenDyslexic-Regular.otf'

function fontFaceText(): string {
  return document.getElementById(FONT_FACE_ID)?.textContent ?? ''
}

describe('DyslexiaFont', () => {
  afterEach(() => {
    document.getElementById(FONT_FACE_ID)?.remove()
    document.documentElement.classList.remove('a11y-dyslexia')
  })

  it('injeta o @font-face com o caminho otf/ publicado pelo pacote no jsDelivr', () => {
    DyslexiaFont.apply(true)

    const css = fontFaceText()
    expect(css).toContain("font-family: 'OpenDyslexic'")
    expect(css).toContain(`url('${EXPECTED_FONT_URL}')`)
    expect(css).not.toContain('/fonts/OpenDyslexic-Regular.otf')
  })

  it('aplica e remove a classe no <html> sem duplicar o @font-face', () => {
    DyslexiaFont.apply(true)
    DyslexiaFont.apply(true)

    expect(document.documentElement.classList.contains('a11y-dyslexia')).toBe(
      true
    )
    expect(document.querySelectorAll(`#${FONT_FACE_ID}`)).toHaveLength(1)

    DyslexiaFont.apply(false)
    expect(document.documentElement.classList.contains('a11y-dyslexia')).toBe(
      false
    )

    DyslexiaFont.apply(true)
    DyslexiaFont.reset()
    expect(document.documentElement.classList.contains('a11y-dyslexia')).toBe(
      false
    )
  })
})

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ACCESSIBILITY_WIDGET_ROOT_IDS,
  isAccessibilityWidgetTarget,
} from '../accessibility-widget-target'

describe('isAccessibilityWidgetTarget', () => {
  it('reconhece o botão do plugin e o que está dentro do painel', () => {
    const wrapper = document.createElement('div')
    wrapper.id = 'a11y-btn-wrapper'
    const button = document.createElement('button')
    wrapper.append(button)
    document.body.append(wrapper)

    const panel = document.createElement('div')
    panel.id = 'a11y-panel'
    const toggle = document.createElement('button')
    panel.append(toggle)
    document.body.append(panel)

    expect(isAccessibilityWidgetTarget(button)).toBe(true)
    expect(isAccessibilityWidgetTarget(toggle)).toBe(true)
    expect(isAccessibilityWidgetTarget(document.body)).toBe(false)

    wrapper.remove()
    panel.remove()
  })

  it('reconhece um clique dentro do shadow root do VLibras', () => {
    const host = document.createElement('div')
    host.id = 'vlibras-access-wrapper'
    const shadow = host.attachShadow({ mode: 'open' })
    const button = document.createElement('button')
    shadow.append(button)
    document.body.append(host)

    expect(isAccessibilityWidgetTarget(button)).toBe(true)

    host.remove()
  })

  it('o CSS global devolve pointer-events a cada host', () => {
    const css = readFileSync(
      path.resolve(__dirname, '../../app/globals.css'),
      'utf8'
    )
    for (const id of ACCESSIBILITY_WIDGET_ROOT_IDS) {
      expect(css).toContain(`#${id}`)
    }
    expect(css).toMatch(/#vlibras-access-wrapper[\s\S]*pointer-events:\s*auto/)
  })
})

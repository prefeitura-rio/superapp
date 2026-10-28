import { describe, expect, test } from 'vitest'
import {
  subtituloBancoCurriculos,
  subtituloMeuCurriculo,
} from '../area-candidato-utils'

const agora = new Date(2026, 9, 22, 12, 0)

describe('subtituloMeuCurriculo', () => {
  test('currículo incompleto pede para terminar de preencher', () => {
    expect(
      subtituloMeuCurriculo(
        {
          curriculoCompleto: false,
          curriculoAtualizadoEm: '2026-10-01T10:00:00-03:00',
        },
        agora
      )
    ).toBe('Termine de preencher')
  })

  test('sem data de atualização conta como incompleto', () => {
    expect(
      subtituloMeuCurriculo(
        { curriculoCompleto: true, curriculoAtualizadoEm: null },
        agora
      )
    ).toBe('Termine de preencher')
  })

  test('completo e atualizado há menos de 6 meses mostra a data', () => {
    expect(
      subtituloMeuCurriculo(
        {
          curriculoCompleto: true,
          curriculoAtualizadoEm: new Date(2026, 3, 23, 9).toISOString(),
        },
        agora
      )
    ).toBe('Atualizado 23.04.26')
  })

  test('atualizado há exatamente 6 meses pede atualização', () => {
    expect(
      subtituloMeuCurriculo(
        {
          curriculoCompleto: true,
          curriculoAtualizadoEm: new Date(2026, 3, 22, 12).toISOString(),
        },
        agora
      )
    ).toBe('Atualizar')
  })

  test('atualizado há mais de 6 meses pede atualização', () => {
    expect(
      subtituloMeuCurriculo(
        {
          curriculoCompleto: true,
          curriculoAtualizadoEm: '2025-01-01T10:00:00-03:00',
        },
        agora
      )
    ).toBe('Atualizar')
  })
})

describe('subtituloBancoCurriculos', () => {
  test('sem currículo', () => {
    expect(
      subtituloBancoCurriculos({ temCurriculo: false, disponivel: false })
    ).toBe('Disponível depois de criar o currículo')
  })

  test('desativado', () => {
    expect(
      subtituloBancoCurriculos({ temCurriculo: true, disponivel: false })
    ).toBe('Recrutadores não podem ver seu currículo')
  })

  // O banco mostra o que a pessoa conseguiu salvar, completo ou não.
  test('ativado', () => {
    expect(
      subtituloBancoCurriculos({ temCurriculo: true, disponivel: true })
    ).toBe('Recrutadores podem ver seu currículo')
  })
})

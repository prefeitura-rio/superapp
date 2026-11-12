import { describe, expect, test } from 'vitest'
import {
  subtituloBancoCurriculos,
  subtituloMeuCurriculo,
  subtituloMinhasCandidaturas,
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
  // O banco segue a regra das vagas: só entra o currículo com o mínimo,
  // mesmo que a escolha salva seja ficar disponível.
  test('currículo sem o mínimo', () => {
    expect(
      subtituloBancoCurriculos({ curriculoCompleto: false, disponivel: true })
    ).toBe('Disponível com o currículo atualizado')
  })

  test('desativado', () => {
    expect(
      subtituloBancoCurriculos({ curriculoCompleto: true, disponivel: false })
    ).toBe('Recrutadores não podem consultar seu currículo')
  })

  test('ativado', () => {
    expect(
      subtituloBancoCurriculos({ curriculoCompleto: true, disponivel: true })
    ).toBe('Recrutadores podem consultar seu currículo')
  })
})

describe('subtituloMinhasCandidaturas', () => {
  test.each([
    [0, 'Sem atualizações'],
    [1, '1 atualização'],
    [3, '3 atualizações'],
  ])('%i → %s', (atualizacoes, esperado) => {
    expect(subtituloMinhasCandidaturas(atualizacoes)).toBe(esperado)
  })
})

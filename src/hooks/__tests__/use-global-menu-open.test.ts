import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { setGlobalMenuOpen, useIsGlobalMenuOpen } from '../use-global-menu-open'

afterEach(() => {
  act(() => setGlobalMenuOpen(false))
})

describe('useIsGlobalMenuOpen', () => {
  it('começa fechado', () => {
    const { result } = renderHook(() => useIsGlobalMenuOpen())
    expect(result.current).toBe(false)
  })

  it('acompanha a abertura e o fechamento do menu', () => {
    const { result } = renderHook(() => useIsGlobalMenuOpen())

    act(() => setGlobalMenuOpen(true))
    expect(result.current).toBe(true)

    act(() => setGlobalMenuOpen(false))
    expect(result.current).toBe(false)
  })

  it('avisa todos os componentes que observam o menu', () => {
    const a = renderHook(() => useIsGlobalMenuOpen())
    const b = renderHook(() => useIsGlobalMenuOpen())

    act(() => setGlobalMenuOpen(true))
    expect(a.result.current).toBe(true)
    expect(b.result.current).toBe(true)
  })
})

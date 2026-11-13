import { describe, expect, it } from 'vitest'
import { USER_PROFILE_MENU_ITEMS } from '../user-profile-menu-items'

describe('USER_PROFILE_MENU_ITEMS (tela "Dados pessoais")', () => {
  it('tem Meus dados, Endereço e Autorizações, nessa ordem', () => {
    expect(
      USER_PROFILE_MENU_ITEMS.map(({ label, href }) => ({ label, href }))
    ).toEqual([
      { label: 'Meus dados', href: '/meu-perfil/informacoes-pessoais' },
      { label: 'Endereço', href: '/meu-perfil/endereco' },
      { label: 'Autorizações', href: '/meu-perfil/autorizacoes' },
    ])
  })

  it('Solicitações, Configurações, FAQ e Sair vivem no menu global', () => {
    const ids = USER_PROFILE_MENU_ITEMS.map(item => item.id)
    for (const id of ['solicitacoes', 'configuracoes', 'faq', 'sair']) {
      expect(ids).not.toContain(id)
    }
  })
})

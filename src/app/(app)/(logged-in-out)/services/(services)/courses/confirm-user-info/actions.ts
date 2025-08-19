'use server'

import type { InscriptionFormData, NearbyUnit, UserInfo } from './types'

export async function getUserInfo(): Promise<UserInfo> {
  await new Promise(resolve => setTimeout(resolve, 100))

  return {
    cpf: '123.456.789-00',
    name: 'João da Silva',
    email: 'joao@email.com',
    phone: '(11) 91234-5678',
  }
}

export async function getNearbyUnits(): Promise<NearbyUnit[]> {
  await new Promise(resolve => setTimeout(resolve, 100))

  return [
    {
      id: '1',
      name: 'Escola Municipal Tenente General Napion',
      address: 'Avenida Almirante Frontin, 50',
      neighborhood: 'Ramos',
      city: 'Rio de Janeiro',
    },
    {
      id: '2',
      name: 'Escola Municipal Santos Dumont',
      address: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
    },
    {
      id: '3',
      name: 'Escola Municipal João XXIII',
      address: 'Rua da Esperança, 456',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
    },
    {
      id: '4',
      name: 'Escola Municipal Paulo Freire',
      address: 'Rua da Liberdade, 789',
      neighborhood: 'Botafogo',
      city: 'Rio de Janeiro',
    },
    {
      id: '5',
      name: 'Escola Municipal Darcy Ribeiro',
      address: 'Avenida das Américas, 1000',
      neighborhood: 'Barra da Tijuca',
      city: 'Rio de Janeiro',
    },
    {
      id: '6',
      name: 'Escola Municipal Clarice Lispector',
      address: 'Rua do Sol, 321',
      neighborhood: 'Lapa',
      city: 'Rio de Janeiro',
    },
    {
      id: '7',
      name: 'Escola Municipal Machado de Assis',
      address: 'Rua da Alegria, 654',
      neighborhood: 'Santa Teresa',
      city: 'Rio de Janeiro',
    },
    {
      id: '8',
      name: 'Escola Municipal Vinicius de Moraes',
      address: 'Avenida Atlântica, 2000',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
    },
    {
      id: '9',
      name: 'Escola Municipal Clarice Lispector',
      address: 'Rua do Sol, 321',
      neighborhood: 'Lapa',
      city: 'Rio de Janeiro',
    },
  ]
}

export async function submitInscription(
  formData: InscriptionFormData
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log('Submitting inscription:', formData)

  return { success: true }
}

export async function updateUserInfo(
  userInfo: Partial<UserInfo>
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 500))

  console.log('Updating user info:', userInfo)

  return { success: true }
}

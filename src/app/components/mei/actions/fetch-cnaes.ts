'use server'

import { getCnaes } from '@/http/cnaes/cnaes'

interface CnaeResult {
  codigo: string
  descricao: string
}

function formatCnaeCode(cnae: {
  subclasse?: string
  classe?: string
  id?: string
}): string {
  if (cnae.subclasse) {
    return cnae.subclasse
  }
  if (cnae.classe) {
    return cnae.classe
  }
  return cnae.id || ''
}

export async function fetchCnaesByIds(
  cnaeIds: string[]
): Promise<CnaeResult[]> {
  if (!cnaeIds.length) {
    return []
  }

  const cnaePromises = cnaeIds.map(async (id): Promise<CnaeResult> => {
    try {
      const response = await getCnaes({ subclasse: id, per_page: 1 })
      if (response.status === 200 && response.data?.cnaes?.length) {
        const cnae = response.data.cnaes[0]
        return {
          codigo: formatCnaeCode(cnae) || id,
          descricao: cnae.denominacao || '',
        }
      }
    } catch (error) {
      console.error('[MEI] Error fetching CNAE:', error)
    }
    // Sem a descrição, o código da oportunidade continua sendo exibido
    return { codigo: id, descricao: '' }
  })

  const results = await Promise.all(cnaePromises)
  return results.filter(c => c.codigo)
}

import { getApiV1EmpregabilidadeModelosTrabalho } from '@/http-courses/empregabilidade-modelos-trabalho/empregabilidade-modelos-trabalho'
import { getApiV1EmpregabilidadeRegimesContratacao } from '@/http-courses/empregabilidade-regimes-contratacao/empregabilidade-regimes-contratacao'
import type {
  EmpregabilidadeModeloTrabalho,
  EmpregabilidadeRegimeContratacao,
} from '@/http-courses/models'
import { NextResponse } from 'next/server'

interface ListResponse<T> {
  data: T[]
  meta: { page: number; page_size: number; total: number }
}

export async function GET() {
  try {
    const [regimesRes, modelosRes] = await Promise.all([
      getApiV1EmpregabilidadeRegimesContratacao({ pageSize: 100 }),
      getApiV1EmpregabilidadeModelosTrabalho({ pageSize: 100 }),
    ])

    const regimesBody =
      regimesRes.data as unknown as ListResponse<EmpregabilidadeRegimeContratacao>
    const modelosBody =
      modelosRes.data as unknown as ListResponse<EmpregabilidadeModeloTrabalho>

    const regimes = Array.isArray(regimesBody?.data)
      ? regimesBody.data
          .filter(r => r.id && r.descricao)
          .map(r => ({ id: r.id as string, descricao: r.descricao as string }))
      : []

    const modelos = Array.isArray(modelosBody?.data)
      ? modelosBody.data
          .filter(m => m.id && m.descricao)
          .map(m => ({ id: m.id as string, descricao: m.descricao as string }))
      : []

    return NextResponse.json({ regimes, modelos })
  } catch (error) {
    console.error('Erro ao buscar lookup de empregos:', error)
    return NextResponse.json({ regimes: [], modelos: [] }, { status: 500 })
  }
}

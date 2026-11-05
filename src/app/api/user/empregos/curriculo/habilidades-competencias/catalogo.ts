import type { EmpregabilidadeCatalogoItem } from '@/http-courses/models'

/** Maior `pageSize` que a Go API aceita nos catálogos de empregabilidade. */
export const CATALOGO_PAGE_SIZE = 100

/** Limite de páginas lidas de um catálogo, para não entrar em laço. */
const CATALOGO_MAX_PAGINAS = 50

export interface ItemCatalogo {
  id: number
  nome: string
}

interface RespostaPaginaCatalogo {
  status: number
  data: unknown
}

/** A Go API respondeu fora de 200 ao ler um catálogo. */
export class CatalogoIndisponivelError extends Error {
  constructor(readonly status: number) {
    super(`Catálogo indisponível (HTTP ${status})`)
    this.name = 'CatalogoIndisponivelError'
  }
}

/** Item com id inteiro positivo e nome; os demais são descartados. */
export function normalizarItemCatalogo(
  item: EmpregabilidadeCatalogoItem | null | undefined
): ItemCatalogo | null {
  const id = Number(item?.id)
  if (!Number.isInteger(id) || id <= 0) return null
  return { id, nome: typeof item?.nome === 'string' ? item.nome : '' }
}

export function normalizarItensCatalogo(
  itens: readonly (EmpregabilidadeCatalogoItem | null | undefined)[] | null
): ItemCatalogo[] {
  const vistos = new Set<number>()
  const resultado: ItemCatalogo[] = []
  for (const item of itens ?? []) {
    const normalizado = normalizarItemCatalogo(item)
    if (!normalizado || vistos.has(normalizado.id)) continue
    vistos.add(normalizado.id)
    resultado.push(normalizado)
  }
  return resultado
}

function lerPagina(data: unknown): {
  itens: EmpregabilidadeCatalogoItem[]
  total: number | null
} {
  if (!data || typeof data !== 'object') return { itens: [], total: null }
  const pagina = data as { data?: unknown; total?: unknown }
  const itens = Array.isArray(pagina.data)
    ? (pagina.data as EmpregabilidadeCatalogoItem[])
    : []
  const total =
    typeof pagina.total === 'number' && Number.isFinite(pagina.total)
      ? pagina.total
      : null
  return { itens, total }
}

/**
 * Lê todas as páginas de um catálogo paginado da Go API (`{ data, total }`).
 * Lança `CatalogoIndisponivelError` se alguma página não responder 200, para
 * que a tela não mostre um catálogo pela metade.
 */
export async function listarCatalogoCompleto(
  buscarPagina: (params: {
    page: number
    pageSize: number
  }) => Promise<RespostaPaginaCatalogo>
): Promise<ItemCatalogo[]> {
  const itens: EmpregabilidadeCatalogoItem[] = []

  for (let page = 1; page <= CATALOGO_MAX_PAGINAS; page++) {
    const resposta = await buscarPagina({
      page,
      pageSize: CATALOGO_PAGE_SIZE,
    })
    if (resposta.status !== 200) {
      throw new CatalogoIndisponivelError(resposta.status)
    }

    const pagina = lerPagina(resposta.data)
    itens.push(...pagina.itens)

    const acabou =
      pagina.itens.length < CATALOGO_PAGE_SIZE ||
      (pagina.total !== null && page * CATALOGO_PAGE_SIZE >= pagina.total)
    if (acabou) break
  }

  return normalizarItensCatalogo(itens)
}

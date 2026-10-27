/**
 * Os quatro vínculos do solicitante com o débito.
 *
 * O valor string é o que vai em `descVinculoRequerente` no corpo do requerimento e em
 * `?tipo=` na URL — códigos estáveis, para não depender de copy que pode mudar.
 *
 * Para a API, o vínculo vai pelo código legado do DAM (`CODIGO_VINCULO_DAM`), não por este.
 *
 * ⚠️ **Este módulo não pode ter `'use client'`.** A page do requerimento (Server Component)
 * chama `isTipoSolicitante` para validar `?tipo=`. Função exportada de módulo client vira
 * referência de cliente no servidor: chamá-la lança "Attempted to call ... from the server",
 * e o `error.tsx` do módulo transforma isso num redirect silencioso para `/servicos`.
 */
export type TipoSolicitante =
  | 'CONTRIBUINTE'
  | 'SOCIO_RESPONSAVEL'
  | 'PROCURADOR'
  | 'PROPRIETARIO_POSSUIDOR'

/** Todos os vínculos aceitos — a page valida `?tipo=` contra esta lista. */
export const TIPOS_SOLICITANTE: readonly TipoSolicitante[] = [
  'CONTRIBUINTE',
  'SOCIO_RESPONSAVEL',
  'PROCURADOR',
  'PROPRIETARIO_POSSUIDOR',
]

/**
 * Código que o DAM espera em `descVinculoRequerente`, herdado do portal legado. Fonte:
 * `RequerimentoParcelamentoRequest` da `api-imoveis` (2=próprio, 1=sócio, 4=procurador,
 * 5=atual proprietário/possuidor). A API usa o código nas regras de documentos: `4` exige
 * procuração e documentos do outorgante, `5` exige o documento imobiliário.
 */
export const CODIGO_VINCULO_DAM: Record<TipoSolicitante, string> = {
  CONTRIBUINTE: '2',
  SOCIO_RESPONSAVEL: '1',
  PROCURADOR: '4',
  PROPRIETARIO_POSSUIDOR: '5',
}

export function isTipoSolicitante(valor: unknown): valor is TipoSolicitante {
  return TIPOS_SOLICITANTE.includes(valor as TipoSolicitante)
}

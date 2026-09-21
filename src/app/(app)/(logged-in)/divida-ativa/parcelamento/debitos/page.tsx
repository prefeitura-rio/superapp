import { EmConstrucao } from '@/app/components/divida-ativa/em-construcao'
import { redirect } from 'next/navigation'

/**
 * Esqueleto da tela de débitos — a próxima fatia.
 *
 * Existe para que o "Continuar" da consulta leve a alguma coisa em vez de 404, e para tornar
 * a fatia da entrada testável de ponta a ponta: a descrição ecoa o critério recebido, então
 * dá para conferir no navegador que o número certo chegou pelo parâmetro certo.
 *
 * A camada de dados desta tela **já existe e está testada**: `getDalDividaAtivaDebitos` em
 * `src/lib/dal.ts` serve o modo inscrição. Falta o Figma do desenho para montar a tela, e
 * falta ligar `POST /divida-ativa/consultar` para os modos CDA e execução fiscal.
 */
export default async function DebitosPage({
  searchParams,
}: {
  searchParams: Promise<{
    inscricao?: string
    cda?: string
    execucaoFiscal?: string
  }>
}) {
  const { inscricao, cda, execucaoFiscal } = await searchParams

  const criterio = inscricao
    ? `inscrição imobiliária ${inscricao}`
    : cda
      ? `certidão de dívida ativa ${cda}`
      : execucaoFiscal
        ? `execução fiscal ${execucaoFiscal}`
        : null

  // Sem critério não há o que consultar: volta para a escolha do modo em vez de mostrar uma
  // tela vazia. O endereço é compartilhável, e um link truncado não deve virar beco sem saída.
  if (!criterio) {
    redirect('/divida-ativa/parcelamento')
  }

  return (
    <EmConstrucao
      titulo="Débitos do imóvel"
      descricao={`Esta tela está sendo construída. A consulta chegou aqui pela ${criterio}.`}
    />
  )
}

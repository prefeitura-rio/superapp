import { CustomButton } from '@/components/ui/custom/custom-button'
import { getDalDividaAtivaRequerimentos } from '@/lib/dal'
import { PROTOCOLO_REQUERIMENTO } from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'

/**
 * "Baixar comprovante" da confirmação do requerimento.
 *
 * O link é buscado aqui, no servidor, pelo protocolo — nunca passa pela URL da página. A
 * URL do comprovante pode levar token, e na barra de endereço ela ficaria no histórico e
 * no `Referer`. A busca também confere que o requerimento é do CPF do token, e o mapper só
 * deixa passar host da Prefeitura.
 *
 * Sem comprovante (o DAM ainda não gerou, protocolo inválido, API fora), o botão some: o
 * cidadão recebe o protocolo por e-mail e o comprovante fica no acompanhamento.
 *
 * ⚠️ Atravessa o ePortal: quem renderiza envolve em `<Suspense>` para não segurar a tela.
 */
export async function ComprovanteRequerimento({
  protocolo,
}: {
  protocolo: string
}) {
  if (!PROTOCOLO_REQUERIMENTO.test(protocolo)) return null

  const { cpf } = await getUserInfoFromToken()
  if (!cpf) return null

  const consulta = await getDalDividaAtivaRequerimentos(cpf, protocolo)
  const url =
    consulta.situacao === 'ok'
      ? consulta.requerimentos[0]?.urlComprovante
      : null
  if (!url) return null

  return (
    <CustomButton asChild variant="secondary" size="lg" fullWidth>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Baixar comprovante
      </a>
    </CustomButton>
  )
}

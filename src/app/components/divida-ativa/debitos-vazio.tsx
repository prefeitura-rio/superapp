import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'

interface DebitosVazioProps {
  /**
   * Texto institucional da API para "não há débitos".
   *
   * Quando vem, é ele que explica — a regra de ouro nº 9 vale também para copy de estado
   * vazio: quem classifica a situação da dívida é o DAM, não o front. O título do Figma
   * permanece acima, porque ele responde à pergunta que o cidadão acabou de fazer ("achei
   * ou não achei?") enquanto a mensagem da API dá o detalhe.
   */
  mensagem?: string | null
}

/**
 * Consulta que não encontrou débito — o sad path do Figma.
 *
 * **Não é erro.** A API responde 200 com listas vazias, e a distinção importa: falha de
 * rede ou indisponibilidade do ePortal sobe para o `error.tsx` do módulo, enquanto isto é
 * uma resposta legítima ("este imóvel não deve nada" ou "este número não existe"). Tratar os
 * dois igual mandaria o cidadão para uma tela de erro quando a notícia é boa.
 *
 * Dois caminhos de saída, como no desenho: corrigir o número (o caso provável — dígito
 * trocado) ou desistir. Nenhum dos dois volta para esta tela, que sem critério não tem o que
 * mostrar.
 */
export function DebitosVazio({ mensagem }: DebitosVazioProps) {
  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 text-3xl font-medium leading-9 text-foreground">
        Não encontramos nenhum débito associado ao número informado
      </h1>

      {mensagem && (
        <p className="pt-6 text-sm font-normal leading-5 text-foreground-light">
          {mensagem}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <CustomButton asChild variant="secondary" size="lg" fullWidth>
          <Link href="/divida-ativa/parcelamento">Pesquisar novamente</Link>
        </CustomButton>

        <CustomButton asChild variant="primary" size="lg" fullWidth>
          <Link href="/">Ir para tela inicial</Link>
        </CustomButton>
      </div>
    </div>
  )
}

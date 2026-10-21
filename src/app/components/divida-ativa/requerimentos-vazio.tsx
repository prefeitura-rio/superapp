import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'

interface RequerimentosVazioProps {
  titulo: string
  /**
   * Texto da API para "não há" — "Não existem pedidos de requerimento para o CPF logado.",
   * "Requerimento nao encontrado.", "Requerimento não associado ao CPF do requerente.".
   * Quem explica é a API (regra de ouro nº 9); o título acima responde à pergunta.
   */
  mensagem: string | null
}

/**
 * Consulta de requerimentos sem resultado — CPF sem requerimento ou protocolo que não
 * existe (ou não é deste CPF).
 *
 * **Não é erro.** A API responde 200 e explica; indisponibilidade do DAM é outra tela
 * (`RequerimentosErro`). Copy provisória, sem Figma para este estado: o desenho entregue
 * cobre só a lista com resultado.
 */
export function RequerimentosVazio({
  titulo,
  mensagem,
}: RequerimentosVazioProps) {
  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 text-3xl font-medium leading-9 text-foreground">
        {titulo}
      </h1>

      {mensagem && (
        <p className="pt-6 text-sm font-normal leading-5 text-foreground-light">
          {mensagem}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <CustomButton asChild variant="secondary" size="lg" fullWidth>
          <Link href="/divida-ativa/acompanhamento">Pesquisar novamente</Link>
        </CustomButton>

        <CustomButton asChild variant="primary" size="lg" fullWidth>
          <Link href="/divida-ativa">Voltar para Dívida Ativa</Link>
        </CustomButton>
      </div>
    </div>
  )
}

import { EmConstrucao } from '@/app/components/divida-ativa/em-construcao'

/**
 * Esqueleto do requerimento de parcelamento — a próxima PR (PR 4).
 *
 * Existe para que o "Continuar" da seleção de parcelas leve a alguma coisa em vez de 404.
 * O fluxo completo (multi-step com upload de documentos e senha) é implementado na PR 4.
 */
export default function RequerimentoPage() {
  return (
    <EmConstrucao
      titulo="Requerimento de parcelamento"
      descricao="Esta etapa está sendo construída. Em breve você poderá enviar o requerimento de parcelamento com a documentação necessária."
    />
  )
}

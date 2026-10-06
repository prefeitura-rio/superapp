import { EmConstrucao } from '@/app/components/divida-ativa/em-construcao'

/**
 * Esqueleto do acompanhamento de requerimento — Fase 3 (Marco 3, 23/10/2026).
 *
 * Mesma razão do parcelamento: a landing já linka para cá, então a rota precisa existir para
 * não entregar 404 a quem testa o módulo com a flag ligada.
 */
export default function AcompanhamentoPage() {
  return (
    <EmConstrucao
      titulo="Acompanhar requerimento de parcelamento"
      descricao="Este serviço está sendo construído e ficará disponível em breve. Enquanto isso, o acompanhamento continua no portal da Prefeitura."
    />
  )
}

import { EmConstrucao } from '@/app/components/divida-ativa/em-construcao'

/**
 * Esqueleto do parcelamento de débitos — Fase 3 (Marco 3, 23/10/2026).
 *
 * A rota existe desde já porque a landing linka para ela: sem este arquivo, quem testa o
 * módulo com a flag ligada bate em 404. A consulta por três identificadores (inscrição, CDA e
 * execução fiscal) depende da premissa P18, ainda em aberto — ver `docs/divida-ativa.md`.
 */
export default function ParcelamentoPage() {
  return (
    <EmConstrucao
      titulo="Parcelar débitos"
      descricao="Este serviço está sendo construído e ficará disponível em breve. Enquanto isso, você pode emitir guias pelos serviços da página de Dívida ativa."
    />
  )
}

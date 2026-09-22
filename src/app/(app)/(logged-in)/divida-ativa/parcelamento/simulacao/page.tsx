import { EmConstrucao } from '@/app/components/divida-ativa/em-construcao'

/**
 * Esqueleto da escolha da data de vencimento — a próxima fatia.
 *
 * Existe para que o "Continuar" da seleção de débitos leve a alguma coisa em vez de 404. A
 * decisão D6 fecha o desenho: a data é escolhida **antes** de simular, numa lista de seleção
 * única, e só então as condições de parcelamento aparecem.
 *
 * A camada de dados ainda não existe: `GET /imoveis/{inscricao}/divida-ativa/datas-vencimento`
 * já está tipado pelo Orval (`DatasVencimentoResponse`), mas sem função de DAL.
 */
export default function SimulacaoPage() {
  return (
    <EmConstrucao
      titulo="Escolha a data de vencimento"
      descricao="Esta etapa está sendo construída. Em breve você poderá escolher a data de vencimento e ver as condições de parcelamento disponíveis."
    />
  )
}

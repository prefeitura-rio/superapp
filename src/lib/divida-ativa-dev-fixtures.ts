/**
 * Fixtures de desenvolvimento do módulo Dívida Ativa.
 *
 * **Só usadas quando `NODE_ENV === 'development'` e a API retorna erro.**
 *
 * O DAL importa este módulo condicionalmente: em produção e em test o import nunca
 * acontece (o guard `process.env.NODE_ENV !== 'development'` corta o caminho antes).
 * Assim o bundle de produção não carrega dado fictício por acidente.
 *
 * A forma dos dados segue `DividaAtivaConsultaResponse` (Orval-gerado), que é o mesmo
 * shape que os handlers MSW em `src/test/mocks/handlers.ts` usam. Se o contrato mudar e
 * os testes atualizarem os mocks, o trecho de manutenção aqui é trivial — está na mesma
 * forma, só numa localização diferente.
 *
 * **Nunca commitar dado real aqui.** Os valores são fictícios de propósito (ver comentário
 * equivalente em `handlers.ts`): é a *forma* que precisa ser fiel, não o dado.
 */

import type { DividaAtivaConsultaResponse } from '@/http-divida-ativa/models'

export const DEV_FIXTURE_DEBITOS: DividaAtivaConsultaResponse = {
  imovel: {
    id: 32,
    cpf: '12345678909',
    dataInclusao: '2026-06-22T15:40:46.477',
    endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
    numInscricao: '00000018',
    nome: 'Casa de praia',
  },
  imovelCadastrado: true,
  cdas: [
    {
      cdaId: '20240000111',
      exercicio: '2024',
      naturezaDivida: 'IPTU',
      receita: 'IPTU/Taxas - Predial',
      situacaoPrincipal: 'EM ABERTO',
      situacaoHonorarios: 'EM ABERTO',
      faseCobranca: 'AJUIZADA',
      valorSaldoPrincipal: '1.234,56',
      valorSaldoHonorarios: '123,45',
      inscricaoImobiliaria: '00000018',
      selecionavelParcelamento: true,
      protocoloRequerimentoAberto: '2026000123',
    },
    {
      cdaId: '20230000999',
      exercicio: '2023',
      naturezaDivida: 'TCL',
      receita: 'TCL - Taxa de Coleta de Lixo',
      situacaoPrincipal: 'EM ABERTO',
      faseCobranca: 'COBRANÇA',
      valorSaldoPrincipal: '456,78',
      inscricaoImobiliaria: '00000018',
      selecionavelParcelamento: true,
    },
  ],
  guiasParceladas: [
    {
      numeroGuia: '900123',
      descricaoSituacaoGuia: 'EM DIA',
      descricaoTipoPagamento: 'PARCELAMENTO',
      faseCobranca: 'AJUIZADA',
      dataVencimento: '15/10/2026',
      qtdPagas: '3',
      qtdeParcelas: '12',
      valorTotalGuia: '1.200,00',
      valorSaldoTotal: '900,00',
      linhaDigitavel: '00190000090123456789012345678901234567890123',
    },
  ],
  totalCdas: 2,
  totalParcelado: 1,
  totalDebitos: 3,
}

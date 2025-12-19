/**
 * Links externos relacionados ao MEI (Microempreendedor Individual)
 */
export const MEI_LINKS = {
  /**
   * Portal do Empreendedor - Abertura de MEI
   * Usado para redirecionar usuários que não possuem empresa MEI
   */
  REGISTRATION:
    'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei',

  /**
   * Portal Simples Nacional - Regularização de situação cadastral
   * Usado para redirecionar usuários com situação cadastral irregular (Suspensa, Inapta, etc)
   */
  REGULARIZATION: 'https://www8.receita.fazenda.gov.br/simplesnacional/',
} as const

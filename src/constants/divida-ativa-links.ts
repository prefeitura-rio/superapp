/**
 * Links externos dos serviços de dívida ativa que **não** são reconstruídos no Pref.Rio.
 *
 * A diretoria retirou estes três fluxos do escopo de modernização (emissão de guia à vista,
 * regularização de parcela em atraso e segunda via de guia). Eles continuam existindo no
 * portal legado, então a landing os oferece como link externo — com o bottom sheet de
 * confirmação que o design exige para qualquer saída do ambiente nativo do app.
 *
 * Ver `docs/divida-ativa.md`.
 */
export const DIVIDA_ATIVA_EXTERNAL_LINKS = {
  /** Emitir guia à vista ou liquidar débitos */
  GUIA_A_VISTA: 'https://daminternet.rio.rj.gov.br/divida',

  /** Emitir guia – parcela em atraso (regularização) */
  GUIA_PARCELA_EM_ATRASO:
    'https://daminternet.rio.rj.gov.br/GuiaPagamento/EmitirRegularizacao',

  /** Emitir segunda via de guia de pagamento */
  SEGUNDA_VIA_GUIA:
    'https://daminternet.rio.rj.gov.br/GuiaPagamento/EmitirSegundaVia',
} as const

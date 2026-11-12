/**
 * Carta de Serviços ao Usuário (Lei Federal nº 13.460/2017).
 *
 * Rota e link de entrada ficam aqui para que a troca do ponto de entrada provisório
 * (hoje no footer) seja uma mudança de uma linha.
 */
export const CARTA_DE_SERVICOS_ROUTE = '/carta-de-servicos'

export const CARTA_DE_SERVICOS_FOOTER_LINK = {
  label: 'Carta de serviços',
  href: CARTA_DE_SERVICOS_ROUTE,
} as const

/** Texto de apresentação exibido na listagem e na página de apresentação do PDF. */
export const LEI_13460_PARAGRAPHS = [
  'A Lei Federal nº 13.460, de 26 de junho de 2017, dispõe sobre participação, proteção e defesa dos direitos do usuário dos serviços públicos prestados direta ou indiretamente pela administração pública.',
  'Nesta Lei está prevista a obrigatoriedade de divulgação de Carta de Serviços ao Usuário, que tem por objetivo informar aos cidadãos sobre os serviços prestados pelos órgãos e entidades, as formas de acesso a esses serviços, os compromissos e padrões de qualidade de atendimento ao público.',
  'Ao trazer informações claras e precisas em relação a cada um dos serviços prestados, a Carta de Serviços aos Usuários amplia o canal de comunicação com o cidadão, estabelecendo-se como importante instrumento de transparência e visibilidade dos serviços executados pela administração pública municipal.',
  'Em atendimento à Lei Federal nº 13.460/2017, o PrefRio permite que os cidadãos consultem as Cartas de Serviços da Prefeitura do Rio de Janeiro. As informações são atualizadas dinamicamente, de acordo com os serviços cadastrados ou alterados pelos órgãos responsáveis no PrefRio, garantindo que os cidadãos tenham acesso a informações atualizadas sobre os serviços oferecidos.',
] as const

/** Rodapé fixo de todas as páginas do PDF. */
export const CARTA_PDF_FOOTER_TEXT =
  'Empresa Municipal de Tecnologia do Rio de Janeiro'

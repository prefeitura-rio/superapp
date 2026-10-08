// Padrões com segmentos dinâmicos (ex: /servicos/trabalho/[id]/inscricao)
export const FOOTER_EXCLUDED_PATTERNS: RegExp[] = [
  /^\/servicos\/trabalho\/[^/]+\/inscricao/,
]

export const FOOTER_EXCLUDED_ROUTES = [
  // Fluxos multi-step de inscrição
  '/servicos/cursos/confirmar-informacoes',
  '/servicos/cursos/atualizar-dados',
  '/servicos/mei',
  // Fluxos de cadastro na carteira
  '/carteira/pet/adicionar',
  '/carteira/cadmicro/adicionar-veiculo',
  '/carteira/cadmicro',
  // Fluxo de dívida ativa
  '/divida-ativa/imoveis/novo',
  '/divida-ativa/imoveis',
  // Fluxos de atualização de perfil
  '/meu-perfil/informacoes-pessoais/atualizar-telefone',
  '/meu-perfil/informacoes-pessoais/atualizar-email',
  '/meu-perfil/informacoes-pessoais/atualizar-nome-exibicao',
  '/meu-perfil/endereco/atualizar-endereco',
  '/meu-perfil/avatar',
  // Tela de sessão expirada
  '/sessao-expirada',
] as const

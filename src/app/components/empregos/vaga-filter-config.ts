export type FilterConfig = {
  id: string
  label: string
  type: 'single' | 'multiple'
  searchable?: boolean
  // options vazias = populadas dinamicamente (regimes/modelos via lookup)
  // ou campo de texto livre (empresa)
  options: { label: string; value: string }[]
}

export const VAGA_FILTERS: FilterConfig[] = [
  {
    id: 'data_publicacao',
    label: 'Data de publicação',
    type: 'single',
    options: [
      { label: 'Qualquer data', value: 'qualquer' },
      { label: 'Hoje', value: 'hoje' },
      { label: 'Última semana', value: 'ultima_semana' },
      { label: 'Último mês', value: 'ultimo_mes' },
    ],
  },
  {
    // value = descricao do regime; o route handler /api/empregos/vagas resolve UUID internamente
    id: 'tipo_vaga',
    label: 'Tipo de vaga',
    type: 'multiple',
    options: [
      { label: 'Efetivo (CLT)', value: 'CLT' },
      { label: 'Estágio', value: 'Estágio' },
      { label: 'Aprendiz', value: 'Aprendiz' },
      { label: 'Temporário', value: 'Temporário' },
      { label: 'Voluntário', value: 'Voluntário' },
      { label: 'Freelancer', value: 'Freelancer' },
      { label: 'Meio Período', value: 'Meio Período' },
    ],
  },
  {
    // value = descricao do modelo; o route handler /api/empregos/vagas resolve UUID internamente
    id: 'modalidade',
    label: 'Modalidade',
    type: 'multiple',
    options: [
      { label: 'Presencial', value: 'Presencial' },
      { label: 'Remoto', value: 'Remoto' },
      { label: 'Híbrido', value: 'Híbrido' },
    ],
  },
  {
    // infinite scroll via /api/empregos/empresas — value = nome_fantasia/razao_social
    id: 'empresa',
    label: 'Empresa',
    type: 'multiple',
    searchable: true,
    options: [],
  },
  {
    id: 'acessibilidade',
    label: 'Acessibilidade',
    type: 'multiple',
    options: [
      { label: 'Preferencial PcD', value: 'preferencial_pcd' },
      { label: 'Exclusivo PcD', value: 'exclusivo_pcd' },
    ],
  },
  {
    id: 'localizacao',
    label: 'Localização',
    type: 'multiple',
    searchable: true,
    options: [
      { label: 'Campo Grande', value: 'Campo Grande' },
      { label: 'Santa Cruz', value: 'Santa Cruz' },
      { label: 'Jacarepaguá', value: 'Jacarepaguá' },
      { label: 'Bangu', value: 'Bangu' },
      { label: 'Realengo', value: 'Realengo' },
      { label: 'Guaratiba', value: 'Guaratiba' },
      { label: 'Barra da Tijuca', value: 'Barra da Tijuca' },
      { label: 'Tijuca', value: 'Tijuca' },
      { label: 'Centro', value: 'Centro' },
      { label: 'Copacabana', value: 'Copacabana' },
      { label: 'Ipanema', value: 'Ipanema' },
      { label: 'Botafogo', value: 'Botafogo' },
      { label: 'Flamengo', value: 'Flamengo' },
      { label: 'Madureira', value: 'Madureira' },
      { label: 'Méier', value: 'Méier' },
      { label: 'Penha', value: 'Penha' },
      { label: 'Ilha do Governador', value: 'Ilha do Governador' },
      { label: 'Anchieta', value: 'Anchieta' },
      { label: 'Pavuna', value: 'Pavuna' },
      { label: 'Deodoro', value: 'Deodoro' },
    ],
  },
]

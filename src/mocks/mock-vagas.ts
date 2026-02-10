import type { VagaCardData } from '@/app/components/empregos/vaga-card'

/**
 * Mock de vagas para desenvolvimento.
 * Badges: modalidade (Presencial/Remoto/Híbrido), bairro, salário (R$1.000,00), Acessível PcD | Preferencial PcD
 */
export const MOCK_VAGAS: VagaCardData[] = [
  {
    id: 1,
    titulo: 'Mestre de Obras - Alta experiência',
    empresaNome: 'Odebrecht Engenharia e Construção',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
      { text: 'Campo Grande', type: 'bairro' },
      { text: 'R$3.200,00', type: 'salary' },
    ],
  },
  {
    id: 2,
    titulo: 'Guia de Turismo Bilíngue',
    empresaNome: 'Prefeitura Municipal do Rio de Janeiro',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Flamengo', type: 'bairro' },
      { text: 'R$1.769,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: 3,
    titulo: 'Engenheiro de Processos Sênior',
    empresaNome: 'Petrobrás S.A.',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Porto Maravilha', type: 'bairro' },
      { text: 'R$8.500,00', type: 'salary' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
    ],
  },
  {
    id: 4,
    titulo: 'Desenvolvedor de Software',
    empresaNome: 'Google',
    badges: [
      { text: 'Remoto', type: 'modality' },
      { text: 'R$7.000,00', type: 'salary' },
    ],
  },
  {
    id: 5,
    titulo: 'Ajudante de Pedreiro',
    empresaNome: 'Prefeitura',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Centro', type: 'bairro' },
      { text: 'R$2.500,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: 6,
    titulo: 'Vendedor de Loja',
    empresaNome: 'SENAI',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Barra da Tijuca', type: 'bairro' },
      { text: 'R$1.800,00', type: 'salary' },
    ],
  },
  {
    id: 7,
    titulo: 'Analista Financeiro',
    empresaNome: 'Banco do Brasil',
    badges: [
      { text: 'Híbrido', type: 'modality' },
      { text: 'Copacabana', type: 'bairro' },
      { text: 'R$5.300,00', type: 'salary' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
    ],
  },
  {
    id: 8,
    titulo: 'Atendente de Telemarketing',
    empresaNome: 'Claro S.A.',
    badges: [
      { text: 'Remoto', type: 'modality' },
      { text: 'R$1.654,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: 9,
    titulo: 'Assistente Administrativo',
    empresaNome: 'Prefeitura Municipal',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Tijuca', type: 'bairro' },
      { text: 'R$3.000,00', type: 'salary' },
    ],
  },
  {
    id: 10,
    titulo: 'Cozinheiro',
    empresaNome: 'Restaurante Carioca',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Botafogo', type: 'bairro' },
      { text: 'R$2.800,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
]

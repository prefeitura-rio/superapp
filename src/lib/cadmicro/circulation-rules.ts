import type { CirculationRule } from '@/lib/cadmicro/types'

export const CIRCULATION_RULES: readonly CirculationRule[] = [
  {
    title: 'Calçadas',
    description:
      'Permitido somente quando houver autorização local e com velocidade máxima de 6 km/h, respeitando o pedestre.',
  },
  {
    title: 'Ciclovias e Ciclofaixas',
    description:
      'Bicicletas elétricas e autopropelidos podem circular respeitando a velocidade da via. Ciclomotores são proibidos.',
  },
  {
    title: 'Ruas e Avenidas (Até 40km/h)',
    description:
      'Autopropelidos e bicicletas elétricas podem circular em vias com limite de até 40km/h, se não houver ciclovia. Ciclomotores podem circular normalmente.',
  },
  {
    title: 'Vias de Trânsito Rápido e Rodovias',
    description:
      'É proibida a circulação de ciclomotores, exceto se houver acostamento. Autopropelidos e bicicletas elétricas nunca podem circular nestas vias.',
  },
]

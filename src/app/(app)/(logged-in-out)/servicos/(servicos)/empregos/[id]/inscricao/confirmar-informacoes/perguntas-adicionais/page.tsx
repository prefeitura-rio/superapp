import { PerguntasAdicionaisContent } from './perguntas-adicionais-content'

export default async function PerguntasAdicionaisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // TODO: Buscar informações complementares da API
  // const informacoesComplementares = await fetchInformacoesComplementares(id)

  // Mock data para desenvolvimento
  const informacoesComplementares = [
    {
      id: '767eb1cd-62b5-4b06-a6f4-6bd30e39b5da',
      id_vaga: '5770fd76-b5f0-4be3-9ecf-73feab5f7a3e',
      titulo: 'Qual é o seu tempo de experiência como Mestre de Obras?',
      obrigatorio: false,
      tipo_campo: 'resposta_curta' as const,
      valor_minimo: null,
      valor_maximo: null,
      opcoes: null,
      created_at: '2026-02-14T17:34:29.379428Z',
      updated_at: '2026-02-14T17:34:29.379428Z',
    },
    {
      id: '9498eeb6-391e-478f-b239-171a8d24d75b',
      id_vaga: '5770fd76-b5f0-4be3-9ecf-73feab5f7a3e',
      titulo: 'Quantas pessoas você já liderou diretamente em obra?',
      obrigatorio: true,
      tipo_campo: 'resposta_numerica' as const,
      valor_minimo: 0,
      valor_maximo: 10,
      opcoes: null,
      created_at: '2026-02-14T17:34:29.379428Z',
      updated_at: '2026-02-14T17:34:29.379428Z',
    },
    {
      id: 'a7017469-a788-4607-8692-89401e61f36d',
      id_vaga: '5770fd76-b5f0-4be3-9ecf-73feab5f7a3e',
      titulo: 'Em quais tipos de obra você já atuou como Mestre de Obras?',
      obrigatorio: true,
      tipo_campo: 'selecao_unica' as const,
      valor_minimo: null,
      valor_maximo: null,
      opcoes: ['Obras residenciais', 'Obras comerciais', 'Obras industriais'],
      created_at: '2026-02-14T17:34:29.379428Z',
      updated_at: '2026-02-14T17:34:29.379428Z',
    },
    {
      id: '2c1509d3-43bf-4802-b40c-47ba39b48e76',
      id_vaga: '5770fd76-b5f0-4be3-9ecf-73feab5f7a3e',
      titulo:
        'Você possui disponibilidade para trabalhar em diferentes canteiros de obra ou localidades?',
      obrigatorio: true,
      tipo_campo: 'selecao_multipla' as const,
      valor_minimo: null,
      valor_maximo: null,
      opcoes: [
        'Sim, tenho total disponibilidade',
        'Sim, mas apenas na minha cidade',
        'Sim, mas apenas na minha região',
      ],
      created_at: '2026-02-14T17:34:29.379428Z',
      updated_at: '2026-02-14T17:34:29.379428Z',
    },
  ]

  return (
    <PerguntasAdicionaisContent
      vagaId={id}
      informacoesComplementares={informacoesComplementares}
    />
  )
}

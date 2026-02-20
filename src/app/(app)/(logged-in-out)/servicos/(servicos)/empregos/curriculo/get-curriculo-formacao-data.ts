import {
  getApiV1EmpregabilidadeCurriculoCpfFormacoes,
  getApiV1EmpregabilidadeCurriculoCpfIdiomas,
} from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'

/** Um item de formação no formato do formulário (para valores iniciais). */
export interface InitialFormacaoItem {
  tipoFormacaoId: string
  nomeInstituicao: string
  nomeCurso: string
  status: string
  anoConclusao: string
}

/** Um item de idioma no formato do formulário (para valores iniciais). */
export interface InitialIdiomaItem {
  idIdioma: string
  idNivel: string
}

export interface CurriculoFormacaoData {
  formacoes: InitialFormacaoItem[]
  idiomas: InitialIdiomaItem[]
}

function parseFormacoesArray(data: unknown): InitialFormacaoItem[] {
  const arr = Array.isArray(data) ? data : []
  return arr.map((item: Record<string, unknown>) => ({
    tipoFormacaoId: String(item.id_escolaridade ?? ''),
    nomeInstituicao: String(item.nome_instituicao ?? ''),
    nomeCurso: String(item.nome_curso ?? ''),
    status: String(item.status ?? ''),
    anoConclusao: String(item.ano_conclusao ?? ''),
  }))
}

function parseIdiomasArray(data: unknown): InitialIdiomaItem[] {
  const arr = Array.isArray(data) ? data : []
  return arr.map((item: Record<string, unknown>) => ({
    idIdioma: String(item.id_idioma ?? ''),
    idNivel: String(item.id_nivel ?? ''),
  }))
}

/**
 * Busca formações e idiomas do currículo por CPF no server.
 * Usar apenas em Server Components.
 */
export async function getCurriculoFormacaoData(
  cpf: string
): Promise<CurriculoFormacaoData> {
  const normalizedCpf = cpf.replace(/\D/g, '')
  if (!normalizedCpf) {
    return { formacoes: [], idiomas: [] }
  }

  const [formacoesRes, idiomasRes] = await Promise.all([
    getApiV1EmpregabilidadeCurriculoCpfFormacoes(normalizedCpf),
    getApiV1EmpregabilidadeCurriculoCpfIdiomas(normalizedCpf),
  ])

  const formacoesBody =
    formacoesRes.status === 200 && formacoesRes.data
      ? ((formacoesRes.data as { data?: unknown }).data ?? formacoesRes.data)
      : null
  const formacoes = parseFormacoesArray(formacoesBody)

  const idiomasBody =
    idiomasRes.status === 200 && idiomasRes.data
      ? ((idiomasRes.data as { data?: unknown }).data ?? idiomasRes.data)
      : null
  const idiomas = parseIdiomasArray(idiomasBody)

  return { formacoes, idiomas }
}

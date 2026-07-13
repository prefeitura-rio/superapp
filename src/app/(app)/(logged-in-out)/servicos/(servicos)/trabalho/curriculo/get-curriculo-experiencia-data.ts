import {
  getApiV1EmpregabilidadeCurriculoCpf,
  getApiV1EmpregabilidadeCurriculoCpfConquistas,
  getApiV1EmpregabilidadeCurriculoCpfExperiencias,
} from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import { convertMonthsToYearsAndMonths } from '@/lib/experiencia-utils'
import type { CurriculoExperienciaFormValues } from './curriculo-experiencia-schema'

function parseExperienciasArray(
  data: unknown
): CurriculoExperienciaFormValues['empregos'] {
  const arr = Array.isArray(data) ? data : []
  return arr.map((item: Record<string, unknown>) => {
    // Convert total months from API to years + months for the form
    const totalMonths =
      typeof item.tempo_experiencia_meses === 'number'
        ? item.tempo_experiencia_meses
        : undefined
    const converted = convertMonthsToYearsAndMonths(totalMonths)

    return {
      cargo: String(item.cargo ?? ''),
      meuEmpregoAtual: Boolean(item.eh_trabalho_atual),
      empresa: String(item.empresa ?? ''),
      descricaoAtividades: String(item.descricao_atividades ?? ''),
      tempoExperienciaAnos: converted?.anos ?? undefined,
      tempoExperienciaMeses: converted?.meses ?? undefined,
      experienciaComprovadaCarteira:
        item.experiencia_comprovada_ct === true
          ? 'Sim'
          : item.experiencia_comprovada_ct === false
            ? 'Não'
            : '',
    }
  })
}

function parseConquistasArray(
  data: unknown
): CurriculoExperienciaFormValues['conquistas'] {
  const arr = Array.isArray(data) ? data : []
  return arr.map((item: Record<string, unknown>) => ({
    idTipoConquista: String(item.id_tipo_conquista ?? ''),
    titulo: String(item.titulo ?? ''),
    descricao: String(item.descricao ?? ''),
  }))
}

function parseResumoProfissional(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const value = (data as { resumo_profissional?: string | null })
    .resumo_profissional
  return typeof value === 'string' ? value : ''
}

const emptyExperienciaValues = (): CurriculoExperienciaFormValues => ({
  empregos: [
    {
      cargo: '',
      meuEmpregoAtual: false,
      empresa: '',
      descricaoAtividades: '',
      tempoExperienciaAnos: undefined,
      tempoExperienciaMeses: undefined,
      experienciaComprovadaCarteira: '',
    },
  ],
  conquistas: [{ idTipoConquista: '', titulo: '', descricao: '' }],
  resumoProfissional: '',
})

/**
 * Busca experiências e conquistas do currículo por CPF no server.
 * Usar apenas em Server Components.
 */
export async function getCurriculoExperienciaData(
  cpf: string
): Promise<CurriculoExperienciaFormValues> {
  const normalizedCpf = cpf.replace(/\D/g, '')
  if (!normalizedCpf) {
    return emptyExperienciaValues()
  }

  const [experienciasRes, conquistasRes, curriculoRes] = await Promise.all([
    getApiV1EmpregabilidadeCurriculoCpfExperiencias(normalizedCpf),
    getApiV1EmpregabilidadeCurriculoCpfConquistas(normalizedCpf),
    getApiV1EmpregabilidadeCurriculoCpf(normalizedCpf),
  ])

  const experienciasBody =
    experienciasRes.status === 200 && experienciasRes.data
      ? ((experienciasRes.data as { data?: unknown }).data ??
        experienciasRes.data)
      : null
  const conquistasBody =
    conquistasRes.status === 200 && conquistasRes.data
      ? ((conquistasRes.data as { data?: unknown }).data ?? conquistasRes.data)
      : null
  const curriculoBody =
    curriculoRes.status === 200 && curriculoRes.data ? curriculoRes.data : null

  const empregos = parseExperienciasArray(experienciasBody)
  const conquistas = parseConquistasArray(conquistasBody)
  const resumoProfissional = parseResumoProfissional(curriculoBody)

  return {
    empregos:
      empregos.length > 0 ? empregos : emptyExperienciaValues().empregos,
    conquistas:
      conquistas.length > 0 ? conquistas : emptyExperienciaValues().conquistas,
    resumoProfissional,
  }
}

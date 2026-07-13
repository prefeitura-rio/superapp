'use server'

import { sendMessage } from '@/http-agent-api/chat/chat'

export type AiImproveContext = 'experiencia-atividades' | 'conquista-descricao'

const MIN_NON_WHITESPACE_CHARS = 30

const AI_IMPROVE_PROMPTS: Record<AiImproveContext, (text: string) => string> = {
  'experiencia-atividades': text =>
    `Melhore o texto abaixo de descrição de atividades profissionais de um currículo.

Regras obrigatórias:
- Priorize formatação em tópicos (bullet points).
- Destaque responsabilidades e competências relevantes para recrutadores e sistemas ATS.
- Corrija problemas de escrita.
- Evite informações genéricas ou redundantes.
- Permaneça fiel às informações fornecidas; NÃO invente experiências, atribuições ou competências.

Retorne apenas o texto melhorado, sem prefácios ou explicações.

Texto original:
${text}`,
  'conquista-descricao': text =>
    `Melhore o texto abaixo de descrição de conquista, certificado, curso ou trabalho voluntário de um currículo.

Regras obrigatórias:
- Priorize clareza e objetividade; use tópicos (bullet points) quando fizer sentido.
- Destaque competências, aprendizados e reconhecimentos relevantes para recrutadores e sistemas ATS.
- Corrija problemas de escrita.
- Evite informações genéricas ou redundantes.
- Permaneça fiel às informações fornecidas; NÃO invente conquistas, certificados, cursos ou competências.

Retorne apenas o texto melhorado, sem prefácios ou explicações.

Texto original:
${text}`,
}

export type ImproveTextWithAiResult =
  | { success: true; text: string }
  | { success: false }

function countNonWhitespaceChars(text: string): number {
  return text.replace(/\s/g, '').length
}

export async function improveTextWithAiAction(params: {
  text: string
  context: AiImproveContext
}): Promise<ImproveTextWithAiResult> {
  const { text, context } = params
  const trimmed = text.trim()

  if (countNonWhitespaceChars(trimmed) < MIN_NON_WHITESPACE_CHARS) {
    return { success: false }
  }

  const buildPrompt = AI_IMPROVE_PROMPTS[context]
  if (!buildPrompt) return { success: false }

  try {
    const response = await sendMessage({
      message: buildPrompt(trimmed),
      session_id: crypto.randomUUID(),
    })

    if (response.status !== 200 || !response.data?.message?.trim()) {
      return { success: false }
    }

    return { success: true, text: response.data.message.trim() }
  } catch {
    return { success: false }
  }
}

export interface ResumoProfissionalSourceEmprego {
  cargo?: string
  empresa?: string
  descricaoAtividades?: string
  tempoExperienciaAnos?: number | null
  tempoExperienciaMeses?: number | null
  experienciaComprovadaCarteira?: string
  meuEmpregoAtual?: boolean
}

export interface ResumoProfissionalSourceConquista {
  titulo?: string
  descricao?: string
}

export interface ResumoProfissionalSource {
  empregos: ResumoProfissionalSourceEmprego[]
  conquistas: ResumoProfissionalSourceConquista[]
}

function formatResumoSource(source: ResumoProfissionalSource): string {
  const empregosText = source.empregos
    .map((e, i) => {
      const tempoParts: string[] = []
      if (e.tempoExperienciaAnos != null && e.tempoExperienciaAnos > 0)
        tempoParts.push(`${e.tempoExperienciaAnos} ano(s)`)
      if (e.tempoExperienciaMeses != null && e.tempoExperienciaMeses > 0)
        tempoParts.push(`${e.tempoExperienciaMeses} mês(es)`)
      const tempo =
        tempoParts.length > 0 ? tempoParts.join(' e ') : 'não informado'

      return [
        `Experiência ${i + 1}:`,
        `- Cargo: ${e.cargo?.trim() || 'não informado'}`,
        `- Empresa: ${e.empresa?.trim() || 'não informado'}`,
        `- Tempo: ${tempo}`,
        `- Emprego atual: ${e.meuEmpregoAtual ? 'sim' : 'não'}`,
        `- Comprovada em carteira: ${e.experienciaComprovadaCarteira || 'não informado'}`,
        `- Atividades: ${e.descricaoAtividades?.trim() || 'não informado'}`,
      ].join('\n')
    })
    .join('\n\n')

  const conquistasText =
    source.conquistas.length > 0
      ? source.conquistas
          .map((c, i) =>
            [
              `Conquista/certificado ${i + 1}:`,
              `- Título: ${c.titulo?.trim() || 'não informado'}`,
              `- Descrição: ${c.descricao?.trim() || 'não informado'}`,
            ].join('\n')
          )
          .join('\n\n')
      : 'Nenhuma conquista ou certificado informado.'

  return `Experiências profissionais:\n${empregosText || 'Nenhuma experiência informada.'}\n\nConquistas e certificados:\n${conquistasText}`
}

function buildResumoGeneratePrompt(source: ResumoProfissionalSource): string {
  return `Com base nas informações abaixo do currículo, escreva um resumo profissional em português, em primeira pessoa, claro e objetivo, destacando os principais pontos da trajetória.

Regras obrigatórias:
- Use apenas as informações fornecidas; NÃO invente experiências, cargos, empresas, competências ou conquistas.
- Seja profissional e adequado para recrutadores e sistemas ATS.
- Evite genéricos e redundâncias.
- Retorne apenas o texto do resumo, sem prefácios ou explicações.

${formatResumoSource(source)}`
}

function buildResumoImprovePrompt(
  text: string,
  source: ResumoProfissionalSource
): string {
  return `Melhore o resumo profissional abaixo, tornando-o mais claro, profissional e alinhado às informações já cadastradas no currículo.

Regras obrigatórias:
- Permaneça fiel ao texto e aos dados cadastrados; NÃO invente experiências, cargos, empresas, competências ou conquistas.
- Corrija problemas de escrita.
- Evite genéricos e redundâncias.
- Retorne apenas o texto melhorado, sem prefácios ou explicações.

Texto atual do resumo:
${text}

Dados cadastrados na seção de experiência:
${formatResumoSource(source)}`
}

function hasAtLeastOneEmprego(source: ResumoProfissionalSource): boolean {
  return source.empregos.some(
    e =>
      (e.cargo?.trim()?.length ?? 0) > 0 &&
      (e.empresa?.trim()?.length ?? 0) > 0 &&
      (e.descricaoAtividades?.trim()?.length ?? 0) > 0
  )
}

export async function improveResumoProfissionalAction(params: {
  mode: 'generate' | 'improve'
  text?: string
  source: ResumoProfissionalSource
}): Promise<ImproveTextWithAiResult> {
  const { mode, text, source } = params

  if (!hasAtLeastOneEmprego(source)) return { success: false }

  const trimmed = text?.trim() ?? ''

  if (
    mode === 'improve' &&
    countNonWhitespaceChars(trimmed) < MIN_NON_WHITESPACE_CHARS
  ) {
    return { success: false }
  }

  const message =
    mode === 'generate'
      ? buildResumoGeneratePrompt(source)
      : buildResumoImprovePrompt(trimmed, source)

  try {
    const response = await sendMessage({
      message,
      session_id: crypto.randomUUID(),
    })

    if (response.status !== 200 || !response.data?.message?.trim()) {
      return { success: false }
    }

    return { success: true, text: response.data.message.trim() }
  } catch {
    return { success: false }
  }
}

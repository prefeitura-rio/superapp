'use server'

import { sendMessage } from '@/http-agent-api/chat/chat'

export type AiImproveContext = 'experiencia-atividades'

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

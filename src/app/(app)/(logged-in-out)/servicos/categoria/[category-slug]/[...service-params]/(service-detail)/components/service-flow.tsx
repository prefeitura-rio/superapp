'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CheckCircle2, ListChecks, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FlowOption {
  value: string
  label: string
  description?: string | null
}

interface FlowStep {
  session_id: string
  done: boolean
  status: string
  title: string
  input: 'list' | 'buttons' | 'confirm' | 'text' | 'retry' | 'done'
  options: FlowOption[]
  corrections?: FlowOption[]
  protocol?: string | null
  sandbox?: boolean
  error?: string | null
}

interface FlowOverview {
  available: boolean
  service_name: string
  steps: { id: string; title: string; kind: string }[]
}

interface TranscriptEntry {
  question: string
  answer: string
}

export function ServiceFlow({
  slug,
  serviceName,
}: {
  slug?: string | null
  serviceName?: string
}) {
  const [overview, setOverview] = useState<FlowOverview | null>(null)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<FlowStep | null>(null)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [busy, setBusy] = useState(false)
  const [textValue, setTextValue] = useState('')

  useEffect(() => {
    if (!slug) return
    let active = true
    fetch(`/api/services/${encodeURIComponent(slug)}/flow`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (active && json?.available) setOverview(json as FlowOverview)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [slug])

  if (!slug || !overview?.available) return null

  async function start() {
    setBusy(true)
    setTranscript([])
    setStep(null)
    setOpen(true)
    try {
      const res = await fetch(
        `/api/flow/${encodeURIComponent(slug ?? '')}/start`,
        {
          method: 'POST',
        }
      )
      setStep((await res.json()) as FlowStep)
    } finally {
      setBusy(false)
    }
  }

  async function answer(value: string, label: string, correction = false) {
    if (!step) return
    setBusy(true)
    setTranscript(prev => [...prev, { question: step.title, answer: label }])
    setTextValue('')
    try {
      const res = await fetch(
        `/api/flow/${encodeURIComponent(slug ?? '')}/step`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            session_id: step.session_id,
            value,
            correction,
          }),
        }
      )
      if (res.status === 409) {
        // session expired — restart
        await start()
        return
      }
      setStep((await res.json()) as FlowStep)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="gap-0 border border-border bg-card py-0">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2.5">
          <ListChecks className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-foreground">
              Atendimento guiado
            </h2>
            <p className="text-xs text-foreground-light">
              Abra seu chamado aqui mesmo, em {overview.steps.length} passos.
            </p>
          </div>
        </div>
        <Button
          className="h-11 w-full rounded-full text-background"
          onClick={start}
        >
          Iniciar atendimento
        </Button>
        <details className="group">
          <summary className="cursor-pointer list-none text-xs text-foreground-light hover:text-foreground">
            Ver etapas
          </summary>
          <ol className="mt-2 space-y-1">
            {overview.steps.map((s, index) => (
              <li
                key={s.id}
                className="flex gap-2 text-xs text-foreground-light"
              >
                <span className="text-primary/70 tabular-nums">
                  {index + 1}.
                </span>
                <span>{s.title}</span>
              </li>
            ))}
          </ol>
        </details>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{serviceName || 'Atendimento guiado'}</DialogTitle>
            <DialogDescription>
              Responda às perguntas para abrir seu chamado.
            </DialogDescription>
          </DialogHeader>

          {/* transcript */}
          {transcript.length > 0 && (
            <div className="space-y-2 border-b border-border pb-3">
              {transcript.map((entry, index) => (
                <div key={index} className="text-xs">
                  <div className="text-foreground-light">{entry.question}</div>
                  <div className="font-medium text-foreground">
                    → {entry.answer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* current step */}
          {!step || busy ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : step.done ? (
            <div className="space-y-3 py-2 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <p className="text-sm text-foreground">{step.title}</p>
              {step.protocol && (
                <p className="text-sm font-medium text-foreground">
                  Protocolo: <span className="font-mono">{step.protocol}</span>
                </p>
              )}
              {step.sandbox && (
                <p className="text-xs text-foreground-light">
                  Ambiente de teste (homologação) — nenhum chamado real foi
                  aberto no SGRC.
                </p>
              )}
              <Button
                className="w-full rounded-full text-background"
                onClick={() => setOpen(false)}
              >
                Concluir
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                {step.title}
              </p>
              {step.error && (
                <p className="text-xs text-destructive">{step.error}</p>
              )}

              {/* options (buttons / list / confirm / retry) */}
              {step.input !== 'text' && (
                <div className="flex flex-col gap-2">
                  {step.options.map(option => (
                    <Button
                      key={option.value || option.label}
                      variant="outline"
                      className="h-auto w-full justify-start rounded-xl py-3 text-left"
                      onClick={() => answer(option.value, option.label)}
                    >
                      <span className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-foreground-light">
                            {option.description}
                          </span>
                        )}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              {/* free-text input */}
              {step.input === 'text' && (
                <form
                  className="flex gap-2"
                  onSubmit={event => {
                    event.preventDefault()
                    if (textValue.trim())
                      answer(textValue.trim(), textValue.trim())
                  }}
                >
                  <Input
                    autoFocus
                    value={textValue}
                    onChange={event => setTextValue(event.target.value)}
                    placeholder="Digite aqui…"
                  />
                  <Button
                    type="submit"
                    className="rounded-full text-background"
                    disabled={!textValue.trim()}
                  >
                    Enviar
                  </Button>
                </form>
              )}

              {/* correction menu (ticket-confirmation hub) */}
              {step.corrections && step.corrections.length > 0 && (
                <details className="rounded-lg border border-border p-3">
                  <summary className="cursor-pointer text-sm text-foreground-light">
                    Corrigir um dado
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {step.corrections.map(correction => (
                      <Button
                        key={correction.value}
                        variant="secondary"
                        size="sm"
                        className="rounded-full"
                        onClick={() =>
                          answer(
                            correction.value,
                            `Corrigir: ${correction.label}`,
                            true
                          )
                        }
                      >
                        {correction.label}
                      </Button>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

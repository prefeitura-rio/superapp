'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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
  field?: string | null
  optional?: boolean
  input: 'list' | 'buttons' | 'confirm' | 'text' | 'retry' | 'done'
  options: FlowOption[]
  corrections?: FlowOption[]
  protocol?: string | null
  sandbox?: boolean
  error?: string | null
}

interface AddressSuggestion {
  main_text: string
  secondary_text: string
  place_id: string
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

// POC-1 WhatsApp bot number (E.164, no "+"). Overridable per environment.
const WHATSAPP_BOT_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || '5521989091014'

// Deep link that hands the in-progress attendance off to the WhatsApp bot,
// carrying the answers already given (from the transcript) as the opening
// message. Pure yes/no confirmations and corrections are filtered out.
function whatsappHref(
  serviceName: string | undefined,
  transcript: { question: string; answer: string }[]
): string {
  const service = serviceName || 'um serviço'
  const lines = transcript
    .filter(
      e =>
        !/^(sim|n[aã]o)$/i.test(e.answer.trim()) &&
        !e.answer.startsWith('Corrigir:')
    )
    .map(e => `• ${e.question} ${e.answer}`)
    .join('\n')
  // standardized message: a single intro, with the answers appended when the
  // citizen already started the guided flow
  const base = `Olá! Quero atendimento sobre "${service}".`
  const message = lines
    ? `${base}\n\nJá adiantei estas informações:\n${lines}`
    : base
  return `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(message)}`
}

// Standardized "continue on WhatsApp" button — same look and label everywhere
// it appears (service card and the guided-flow runner).
function WhatsAppButton({ href }: { href: string }) {
  return (
    <Button
      asChild
      className="h-11 w-full rounded-full bg-[#25D366] text-white hover:bg-[#1ebe57]"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        Atendimento pelo WhatsApp
      </a>
    </Button>
  )
}

// Field-aware placeholder for free-text steps.
function textPlaceholder(field?: string | null): string {
  switch (field) {
    case 'ponto_referencia':
      return 'Ex.: em frente à padaria, esquina com a Rua X…'
    case 'email':
      return 'seu@email.com'
    case 'name':
      return 'Seu nome completo'
    case 'cpf':
      return '000.000.000-00'
    default:
      return 'Digite aqui…'
  }
}

// Progressive CPF mask: digits → 000.000.000-00 (kept in sync as the user types).
function maskCpf(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// Skip affordance for optional steps. Both send a value the backend skips
// deterministically (so nothing is stored): the reference point is an optional
// free-text slot that accepts an empty answer; identification fields treat
// "pular" as a skip token.
function skipFor(field?: string | null): { value: string; label: string } {
  if (field === 'ponto_referencia') {
    return { value: '', label: 'Não tenho ponto de referência' }
  }
  return { value: 'pular', label: 'Pular esta etapa' }
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
  // raw submissions, so "back" can deterministically replay the flow up to the
  // previous question (the backend session is server-side, so we re-walk it)
  const [answers, setAnswers] = useState<
    { value: string; correction: boolean }[]
  >([])
  const bodyRef = useRef<HTMLDivElement>(null)

  function scrollBodyToBottom() {
    const el = bodyRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

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
    setAnswers([])
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
    setAnswers(prev => [...prev, { value, correction }])
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

  // Go back one question: re-open a fresh session and replay every answer except
  // the last (the flow is deterministic, so this lands on the previous step).
  async function goBack() {
    if (busy || answers.length === 0) return
    const replay = answers.slice(0, -1)
    const keptTranscript = transcript.slice(0, -1)
    setBusy(true)
    setTextValue('')
    try {
      const startRes = await fetch(
        `/api/flow/${encodeURIComponent(slug ?? '')}/start`,
        { method: 'POST' }
      )
      let cur = (await startRes.json()) as FlowStep
      for (const a of replay) {
        const res = await fetch(
          `/api/flow/${encodeURIComponent(slug ?? '')}/step`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              session_id: cur.session_id,
              value: a.value,
              correction: a.correction,
            }),
          }
        )
        cur = (await res.json()) as FlowStep
      }
      setStep(cur)
      setTranscript(keptTranscript)
      setAnswers(replay)
    } finally {
      setBusy(false)
    }
  }

  const answered = transcript.length
  const progress = step?.done ? 100 : Math.min(90, 12 + answered * 18)

  return (
    <>
      {/* Trigger card — aligned with the service-detail QuickInfo cards */}
      <Card className="gap-0 border-0 bg-card py-0 shadow-none">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ListChecks className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-foreground">
                Atendimento guiado
              </h2>
              <p className="text-xs text-foreground-light leading-4">
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
          {/* go straight to the WhatsApp bot, without the in-page flow */}
          <WhatsAppButton href={whatsappHref(serviceName, [])} />
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-foreground-light hover:text-foreground">
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
              Ver etapas
            </summary>
            <ol className="mt-2 space-y-1 pl-1">
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
      </Card>

      {/* Runner — native bottom sheet (vaul), matching the app's drawers */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto max-w-lg !rounded-t-3xl px-0 pb-0">
          {/* grab handle */}
          <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-popover-line" />

          {/* header */}
          <div className="shrink-0 px-5 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ListChecks className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <DrawerTitle className="truncate text-base font-medium text-foreground">
                  {serviceName || 'Atendimento guiado'}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-foreground-light">
                  {step?.done
                    ? 'Atendimento concluído'
                    : `Pergunta ${answered + 1}`}
                </DrawerDescription>
              </div>
            </div>
            <Progress value={progress} className="mt-3 h-1.5" />
          </div>

          {/* body */}
          <div
            ref={bodyRef}
            className="max-h-[62vh] space-y-4 overflow-y-auto px-5 pb-8 pt-1"
          >
            {/* transcript recap — the citizen's answers so far (also the data
                they review at the confirmation hub) */}
            {transcript.length > 0 && !step?.done && (
              <div className="space-y-2 rounded-2xl bg-accent/60 p-3">
                {transcript.map((entry, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground-light">
                        {entry.question}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {entry.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* current step */}
            {!step || busy ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-foreground-light">Um instante…</p>
              </div>
            ) : step.done ? (
              <div className="space-y-4 py-2 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-secondary">
                  <CheckCircle2 className="h-9 w-9 text-success" />
                </span>
                <p className="text-base font-medium text-foreground">
                  {step.title}
                </p>
                {step.protocol && (
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs text-foreground-light">
                      Número do protocolo
                    </p>
                    <p className="mt-1 font-mono text-lg font-medium text-foreground">
                      {step.protocol}
                    </p>
                  </div>
                )}
                {step.sandbox && (
                  <p className="rounded-xl bg-accent/60 px-3 py-2 text-xs text-foreground-light">
                    Ambiente de teste (homologação) — nenhum chamado real foi
                    aberto no SGRC.
                  </p>
                )}
                <Button
                  className="h-12 w-full rounded-full text-background"
                  onClick={() => setOpen(false)}
                >
                  Concluir
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {answers.length > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={busy}
                    className="-mt-1 flex items-center gap-1 text-xs text-foreground-light transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Voltar
                  </button>
                )}
                <p className="text-base font-medium text-foreground leading-6">
                  {step.title}
                </p>
                {step.error && (
                  <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {step.error}
                  </p>
                )}

                {/* free-text input */}
                {step.input === 'text' ? (
                  step.field === 'address' ? (
                    <AddressAutocomplete
                      key={`addr-${step.status}`}
                      busy={busy}
                      onSubmit={value => answer(value, value)}
                    />
                  ) : (
                    <form
                      className="space-y-2"
                      onSubmit={event => {
                        event.preventDefault()
                        const raw = textValue.trim()
                        if (!raw) return
                        // CPF is shown masked but submitted as bare digits.
                        const value =
                          step.field === 'cpf' ? raw.replace(/\D/g, '') : raw
                        if (value) answer(value, raw)
                      }}
                    >
                      <div className="flex gap-2">
                        <Input
                          autoFocus
                          value={textValue}
                          onChange={event =>
                            setTextValue(
                              step.field === 'cpf'
                                ? maskCpf(event.target.value)
                                : event.target.value
                            )
                          }
                          placeholder={textPlaceholder(step.field)}
                          inputMode={
                            step.field === 'cpf' ? 'numeric' : undefined
                          }
                          maxLength={step.field === 'cpf' ? 14 : undefined}
                          type={step.field === 'email' ? 'email' : 'text'}
                          className="h-12 rounded-xl"
                        />
                        <Button
                          type="submit"
                          className="h-12 shrink-0 rounded-full text-background"
                          disabled={!textValue.trim()}
                        >
                          Enviar
                        </Button>
                      </div>
                      {/* optional step: let the citizen skip it deterministically */}
                      {step.optional && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-full rounded-full"
                          disabled={busy}
                          onClick={() => {
                            const s = skipFor(step.field)
                            answer(s.value, s.label)
                          }}
                        >
                          {skipFor(step.field).label}
                        </Button>
                      )}
                    </form>
                  )
                ) : step.input === 'confirm' ? (
                  /* decision: first option primary, the rest outline */
                  <div className="flex flex-col gap-2">
                    {step.options.map((option, index) => (
                      <Button
                        key={option.value || option.label}
                        variant={index === 0 ? 'default' : 'outline'}
                        className={cn(
                          'h-12 w-full rounded-full',
                          index === 0 && 'text-background'
                        )}
                        onClick={() => answer(option.value, option.label)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                ) : step.input === 'retry' ? (
                  <div className="flex flex-col gap-2">
                    {step.options.map(option => (
                      <Button
                        key={option.value || option.label}
                        className="h-12 w-full rounded-full text-background"
                        onClick={() => answer(option.value, option.label)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  /* buttons / list → tappable selection cards */
                  <div className="flex flex-col gap-2">
                    {step.options.map(option => (
                      <button
                        key={option.value || option.label}
                        type="button"
                        onClick={() => answer(option.value, option.label)}
                        className="group/opt flex w-full items-center gap-3 rounded-2xl border border-transparent bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent active:bg-accent"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="mt-0.5 text-xs text-foreground-light leading-4">
                              {option.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-foreground-light transition-colors group-hover/opt:text-primary" />
                      </button>
                    ))}
                  </div>
                )}

                {/* correction hub */}
                {step.corrections && step.corrections.length > 0 && (
                  <details
                    className="group rounded-2xl border border-border p-3"
                    onToggle={event => {
                      // reveal the correction chips: scroll the sheet body to the
                      // bottom when the citizen opens the menu
                      if (event.currentTarget.open) {
                        setTimeout(scrollBodyToBottom, 80)
                      }
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-foreground-light">
                      <SlidersHorizontal className="h-4 w-4" />
                      Corrigir um dado
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2">
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

            {/* footer: hand off to the WhatsApp bot + trust mark */}
            {step && !step.done && (
              <div className="space-y-2 border-t border-border pt-3">
                <WhatsAppButton href={whatsappHref(serviceName, transcript)} />
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-foreground-light">
                  <Lock className="h-3 w-3" />
                  Suas respostas seguem com você · atendimento oficial da
                  Prefeitura do Rio
                </p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

/**
 * Address field with Google-powered suggestions (same UX as the profile's
 * "atualizar endereço"): as the citizen types, we debounce-query the app's
 * /api/address-autocomplete (Google Places) and show a picker. Picking a
 * suggestion submits it directly — no separate "send" button. Enter remains a
 * silent fallback so the step never dead-ends if no suggestion is available.
 * Used for every flow's shared `address` slot.
 */
function AddressAutocomplete({
  onSubmit,
  busy,
}: {
  onSubmit: (value: string) => void
  busy: boolean
}) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    if (value.trim().length <= 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      fetch(`/api/address-autocomplete?q=${encodeURIComponent(value)}`)
        .then(res => (res.ok ? res.json() : { results: [] }))
        .then(data => {
          setSuggestions(data.results || [])
          setShowList(true)
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [value])

  function choose(s: AddressSuggestion) {
    const full = s.secondary_text
      ? `${s.main_text}, ${s.secondary_text}`
      : s.main_text
    setValue(full)
    setSuggestions([])
    setShowList(false)
    // selecting the right option is the submit action
    onSubmit(full)
  }

  return (
    <form
      className="space-y-2"
      onSubmit={event => {
        event.preventDefault()
        if (value.trim()) onSubmit(value.trim())
      }}
    >
      <div className="relative">
        <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-light" />
        <Input
          autoFocus
          autoComplete="off"
          value={value}
          onChange={event => setValue(event.target.value)}
          onFocus={() => suggestions.length > 0 && setShowList(true)}
          placeholder="Digite o endereço…"
          className="h-12 rounded-xl pl-9"
          disabled={busy}
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-foreground-light" />
        )}
      </div>

      {showList && suggestions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          {suggestions.map(s => (
            <button
              key={s.place_id}
              type="button"
              onClick={() => choose(s)}
              className="flex w-full items-start gap-2 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground-light" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {s.main_text}
                </span>
                {s.secondary_text && (
                  <span className="block truncate text-xs text-foreground-light">
                    {s.secondary_text}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-foreground-light">
        Digite e toque no endereço certo nas sugestões do Google.
      </p>
    </form>
  )
}

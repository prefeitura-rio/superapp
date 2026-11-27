'use client'

import { XIcon } from '@/assets/icons'
import { Card, CardContent } from '@/components/ui/card'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  useCookieConsent,
  useCookiePreferencesOpen,
} from '@/hooks/use-cookie-consent'
import { useIsGlobalMenuOpen } from '@/hooks/use-global-menu-open'
import {
  closeCookiePreferences,
  openCookiePreferences,
  saveCookieConsent,
} from '@/lib/cookie-consent/browser'
import {
  ALL_ACCEPTED,
  ALL_REJECTED,
  COOKIE_POLICY_ROUTE,
  type CookieConsentCategory,
  type CookieConsentChoices,
  type CookieConsentRecord,
} from '@/lib/cookie-consent/consent'
import { reloadPage } from '@/lib/cookie-consent/reload'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useCallback, useState } from 'react'

interface CookieConsentProps {
  className?: string
}

/**
 * Banner de cookies (primeiro nível) e painel de preferências (segundo nível),
 * seguindo o Guia de Cookies da ANPD:
 * - nada além dos cookies necessários roda antes da escolha;
 * - "Apenas essenciais" fica sempre visível no primeiro nível, ao lado
 *   de "Aceitar todos", no mesmo estilo dos botões secundários do painel;
 * - no painel, "Apenas essenciais" e "Aceitar todos" ficam lado a lado;
 *   "Salvar preferências" confirma a escolha do interruptor;
 * - com uma única categoria opcional (Análise), o banner não tem
 *   "Personalizar": o painel é aberto por "Preferências de cookies" no rodapé
 *   e na Política de cookies. Se surgir outra categoria, volte o botão;
 * - cada categoria é escolhida separadamente e começa desligada;
 * - a escolha pode ser revista a qualquer momento, e revogar apaga os cookies
 *   dos terceiros.
 */
export function CookieConsent({ className }: CookieConsentProps) {
  const consent = useCookieConsent()
  const isPreferencesOpen = useCookiePreferencesOpen()
  // Com o menu global (modal) aberto, o banner não recebe cliques: o toque
  // cairia no item do menu por baixo. Fica oculto e volta ao fechar o menu.
  // Com o painel de preferências aberto, o banner ficaria por cima dele.
  const isGlobalMenuOpen = useIsGlobalMenuOpen()

  const save = useCallback((choices: CookieConsentChoices) => {
    const { revoked } = saveCookieConsent(choices)
    closeCookiePreferences()
    // O GA já carregado só sai da página recarregando.
    if (revoked.length > 0) reloadPage()
  }, [])

  return (
    <>
      {consent === null ? (
        <CookieBanner
          className={cn(
            (isGlobalMenuOpen || isPreferencesOpen) && 'hidden',
            className
          )}
          onAcceptAll={() => save(ALL_ACCEPTED)}
          onRejectAll={() => save(ALL_REJECTED)}
        />
      ) : null}
      <CookiePreferencesDialog
        open={isPreferencesOpen}
        consent={consent ?? null}
        onSave={save}
      />
    </>
  )
}

interface CookieBannerProps {
  className?: string
  onAcceptAll: () => void
  onRejectAll: () => void
}

function CookieBanner({
  className,
  onAcceptAll,
  onRejectAll,
}: CookieBannerProps) {
  return (
    <div
      role="region"
      aria-label="Consentimento de cookies"
      className={cn(
        'fixed z-51! left-1/2 bottom-4 -translate-x-1/2 w-full sm:max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700',
        className
      )}
    >
      <Card className="mx-3 p-0 py-3 shadow-lg">
        <CardContent className="flex flex-col gap-4 p-0 px-3.5">
          {/* Só finalidades reais: o Pref.Rio não usa cookies de publicidade. */}
          <p className="text-xs text-muted-foreground sm:text-sm">
            Utilizamos cookies para aprimorar sua experiência de navegação e
            analisar nosso tráfego. Ao clicar em “Aceitar todos”, você está
            ciente da utilização de cookies em conformidade com nossa{' '}
            <Link
              href={COOKIE_POLICY_ROUTE}
              className="text-primary underline underline-offset-4 hover:no-underline"
            >
              Política de Cookies
            </Link>
            .
          </p>
          {/* Os botões ocupam a largura do banner (ver BANNER_ACTIONS_GRID_CLASS). */}
          <div className="@container">
            <div className={BANNER_ACTIONS_GRID_CLASS}>
              <CustomButton
                variant="secondary"
                size="md"
                onClick={onRejectAll}
                className={cn(PILL_BUTTON_CLASS)}
              >
                Apenas essenciais
              </CustomButton>
              <CustomButton
                variant="primary"
                size="md"
                onClick={onAcceptAll}
                className={PILL_BUTTON_CLASS}
              >
                Aceitar todos
              </CustomButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface CookiePreferencesDialogProps {
  open: boolean
  consent: CookieConsentRecord | null
  onSave: (choices: CookieConsentChoices) => void
}

function CookiePreferencesDialog({
  open,
  consent,
  onSave,
}: CookiePreferencesDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={isOpen =>
        isOpen ? openCookiePreferences() : closeCookiePreferences()
      }
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] max-w-[calc(100%-2rem)] gap-4 overflow-y-auto rounded-2xl border-0 p-4 shadow-lg sm:max-w-[576px]"
      >
        {/* Desmonta ao fechar: as chaves voltam à escolha salva a cada abertura. */}
        <CookiePreferencesForm consent={consent} onSave={onSave} />
      </DialogContent>
    </Dialog>
  )
}

function CookiePreferencesForm({
  consent,
  onSave,
}: Omit<CookiePreferencesDialogProps, 'open'>) {
  const [choices, setChoices] = useState<CookieConsentChoices>({
    analytics: consent?.analytics ?? false,
  })

  const toggle = (category: CookieConsentCategory) => (checked: boolean) =>
    setChoices(current => ({ ...current, [category]: checked }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <DialogTitle className="text-base font-medium leading-5">
          Preferências de cookies
        </DialogTitle>
        <DialogClose className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-foreground">
          <XIcon className="size-5" />
          <span className="sr-only">Fechar</span>
        </DialogClose>
      </div>

      <DialogDescription className="text-sm leading-5 text-foreground-light">
        Escolha quais cookies o Pref.Rio pode usar. Os necessários ficam sempre
        ativos, porque sem eles o site não funciona. Os demais só são ativados
        com a sua permissão, e você pode mudar a escolha quando quiser. Detalhes
        sobre cada cookie, prazos e seus direitos na{' '}
        <Link
          href={COOKIE_POLICY_ROUTE}
          onClick={closeCookiePreferences}
          className="text-primary underline underline-offset-4 hover:no-underline"
        >
          Política de cookies.
        </Link>
      </DialogDescription>

      <ul className="flex flex-col gap-1.5">
        {CATEGORIES.map(category => (
          <li
            key={category.id}
            className="flex flex-col gap-2 rounded-2xl bg-card p-4"
          >
            <div className="flex items-center justify-between gap-4">
              {category.alwaysActive ? (
                <p className="min-w-0 flex-1 text-sm font-normal leading-5 text-foreground">
                  {category.title}
                </p>
              ) : (
                <Label
                  htmlFor={`cookie-consent-${category.id}`}
                  className="block min-w-0 flex-1 cursor-pointer text-sm font-normal leading-5 text-foreground"
                >
                  {category.title}
                </Label>
              )}
              {category.alwaysActive ? (
                <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-2 py-1 text-xs font-normal leading-4 text-foreground">
                  Sempre ativos
                </span>
              ) : (
                <Switch
                  id={`cookie-consent-${category.id}`}
                  aria-describedby={`cookie-consent-${category.id}-description`}
                  checked={choices[category.id]}
                  onCheckedChange={toggle(category.id)}
                  className="cookie-preferences-switch shrink-0"
                />
              )}
            </div>
            <p
              id={`cookie-consent-${category.id}-description`}
              className="text-sm leading-5 text-foreground-light"
            >
              {category.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <CustomButton
            variant="secondary"
            size="md"
            onClick={() => onSave(ALL_REJECTED)}
            className={cn(PREFERENCES_BUTTON_CLASS, 'min-w-0 flex-1')}
          >
            Apenas essenciais
          </CustomButton>
          <CustomButton
            variant="secondary"
            size="md"
            onClick={() => onSave(ALL_ACCEPTED)}
            className={cn(PREFERENCES_BUTTON_CLASS, 'min-w-0 flex-1')}
          >
            Aceitar todos
          </CustomButton>
        </div>
        <CustomButton
          variant="primary"
          size="md"
          onClick={() => onSave(choices)}
          className={cn(PREFERENCES_BUTTON_CLASS, 'w-full')}
        >
          Salvar preferências
        </CustomButton>
      </div>
    </div>
  )
}

/**
 * Raio do botão "Faça seu login" do Menu global (pílula). O `CustomButton`
 * `md` já tem a mesma altura (40px) e texto, mas vem com `rounded-2xl`.
 * "Aceitar todos" do banner usa essa altura. "Apenas essenciais" do banner
 * e os botões do painel usam `PREFERENCES_BUTTON_CLASS` (44px).
 */
export const PILL_BUTTON_CLASS = 'rounded-full'

/** Botões do painel: 44px de altura, como no Figma. */
const PREFERENCES_BUTTON_CLASS = cn(PILL_BUTTON_CLASS, 'h-11 px-5 py-3')

/** Banner (2 botões): empilhados ou lado a lado. */
const BANNER_ACTIONS_GRID_CLASS =
  'grid grid-cols-1 gap-2 @min-[25rem]:grid-cols-2'

type CategoryInfo =
  | {
      id: 'necessary'
      alwaysActive: true
      title: string
      description: string
    }
  | {
      id: CookieConsentCategory
      alwaysActive: false
      title: string
      description: string
    }

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'necessary',
    alwaysActive: true,
    title: 'Necessários',
    description:
      'Fazem o site funcionar: mantêm seu login, guardam esta escolha de cookies e lembram etapas de formulários e avaliações. Não podem ser desligados aqui.',
  },
  {
    id: 'analytics',
    alwaysActive: false,
    title: 'Análise (Google Analytics)',
    description:
      'Contam visitas e cliques para sabermos quais páginas e serviços são mais usados e onde melhorar. Os dados são tratados pelo Google, inclusive nos Estados Unidos.',
  },
]

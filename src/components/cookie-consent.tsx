'use client'

import { XIcon } from '@/assets/icons'
import { Card, CardContent } from '@/components/ui/card'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
 * - "Rejeitar não necessários" fica sempre visível no primeiro nível, ao lado
 *   de "Aceitar todos" (cinza, por decisão de design);
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
                className={PILL_BUTTON_CLASS}
              >
                Rejeitar não necessários
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
        className="max-h-[90dvh] gap-5 overflow-y-auto sm:max-w-[min(42rem,calc(100%-2rem))]"
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
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="pr-8">Preferências de cookies</DialogTitle>
        <DialogDescription>
          Escolha quais cookies o Pref.Rio pode usar. Os necessários ficam
          sempre ativos, porque sem eles o site não funciona. Os demais só são
          ativados com a sua permissão, e você pode mudar a escolha quando
          quiser.
        </DialogDescription>
      </DialogHeader>

      <DialogClose className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <XIcon className="size-5" />
        <span className="sr-only">Fechar</span>
      </DialogClose>

      <ul className="flex flex-col gap-4">
        {CATEGORIES.map(category => (
          <li
            key={category.id}
            className="flex flex-col gap-1 rounded-md border p-3"
          >
            <div className="flex items-center justify-between gap-4">
              {category.alwaysActive ? (
                <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  {category.title}
                </p>
              ) : (
                <Label
                  htmlFor={`cookie-consent-${category.id}`}
                  className="block min-w-0 flex-1 cursor-pointer text-sm font-medium leading-5 text-foreground"
                >
                  {category.title}
                </Label>
              )}
              {category.alwaysActive ? (
                <span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground">
                  Sempre ativos
                </span>
              ) : (
                <Switch
                  id={`cookie-consent-${category.id}`}
                  aria-describedby={`cookie-consent-${category.id}-description`}
                  checked={choices[category.id]}
                  onCheckedChange={toggle(category.id)}
                  // Mesmo tamanho do switch "Tema claro" do Menu global: no
                  // tamanho padrão a bolinha (19px) não cabe na pílula.
                  className="large-switch shrink-0"
                />
              )}
            </div>
            <p
              id={`cookie-consent-${category.id}-description`}
              className="text-xs text-muted-foreground"
            >
              {category.description}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        Detalhes sobre cada cookie, prazos e seus direitos na{' '}
        <Link
          href={COOKIE_POLICY_ROUTE}
          onClick={closeCookiePreferences}
          className="text-primary underline underline-offset-4 hover:no-underline"
        >
          Política de cookies
        </Link>
        .
      </p>

      {/* Mesma ordem e estilo do banner: Salvar e Rejeitar (cinza), Aceitar. */}
      <div className="@container">
        <DialogFooter className={DIALOG_ACTIONS_GRID_CLASS}>
          <CustomButton
            variant="secondary"
            size="md"
            onClick={() => onSave(choices)}
            className={PILL_BUTTON_CLASS}
          >
            Salvar preferências
          </CustomButton>
          <CustomButton
            variant="secondary"
            size="md"
            onClick={() => onSave(ALL_REJECTED)}
            className={PILL_BUTTON_CLASS}
          >
            Rejeitar não necessários
          </CustomButton>
          <CustomButton
            variant="primary"
            size="md"
            onClick={() => onSave(ALL_ACCEPTED)}
            className={cn(PILL_BUTTON_CLASS, LAST_ACTION_CLASS)}
          >
            Aceitar todos
          </CustomButton>
        </DialogFooter>
      </div>
    </>
  )
}

/**
 * Raio do botão "Faça seu login" do Menu global (pílula). O `CustomButton`
 * `md` já tem a mesma altura (40px) e texto, mas vem com `rounded-2xl`.
 * Usado em todos os botões de cookies (banner, painel e Política de cookies).
 */
export const PILL_BUTTON_CLASS = 'rounded-full'

/**
 * Grades dos botões, pela largura do próprio container (container query, não
 * da tela): os botões esticam para ocupar a largura. Cada coluna precisa
 * caber "Rejeitar não necessários" (~194px), então 2 colunas a partir de
 * 25rem e 3 a partir de 37.5rem. Em rem para acompanhar zoom e tamanho de
 * fonte. O elemento pai precisa da classe `@container`.
 */
/** Banner (2 botões): empilhados ou lado a lado. */
const BANNER_ACTIONS_GRID_CLASS =
  'grid grid-cols-1 gap-2 @min-[25rem]:grid-cols-2'

/** Painel (3 botões): empilhados, 2 + 1 embaixo ou 3 lado a lado. */
const DIALOG_ACTIONS_GRID_CLASS =
  'grid grid-cols-1 gap-2 @min-[25rem]:grid-cols-2 @min-[37.5rem]:grid-cols-3'

/** Último botão ("Aceitar todos"): ocupa a linha inteira no layout 2 + 1. */
const LAST_ACTION_CLASS = '@min-[25rem]:col-span-2 @min-[37.5rem]:col-span-1'

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

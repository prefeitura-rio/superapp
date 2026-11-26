import { Breadcrumb } from '@/app/components/breadcrumb'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { CookiePreferencesButton } from '@/components/cookie-preferences-button'
import { LOGIN_MARKER_COOKIE } from '@/lib/analytics/login-marker'
import { VOTER_TOKEN_COOKIE } from '@/lib/carta-servicos/avaliacao/voter-token'
import { FORMULARIO_MARKER_COOKIE } from '@/lib/chamados/formulario-marker'
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_VERSION,
} from '@/lib/cookie-consent/consent'
import {
  isSalesforceServicesEnabled,
  isServiceRatingEnabled,
} from '@/lib/feature-flags'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Política de cookies',
  description:
    'Quais cookies o Pref.Rio usa, para quê, por quanto tempo e como mudar ou revogar a sua escolha.',
}

/** Atualize junto com `COOKIE_CONSENT_VERSION` quando a política mudar. */
const POLICY_UPDATED_AT = 'Novembro de 2026'

/**
 * Política de cookies do Pref.Rio.
 *
 * Estrutura e bases legais seguem a Política de Cookies validada da
 * Prefeitura; a lista de cookies reflete o que este site grava de fato. O
 * Pref.Rio é o site oficial: a página não remete a outros sites da
 * Prefeitura. Ao incluir um cookie ou um terceiro novo, atualize esta página
 * e, se mudar finalidade ou terceiro, a `COOKIE_CONSENT_VERSION`.
 */
export default function CookiesPolicy() {
  const necessaryCookies = getNecessaryCookies({
    salesforce: isSalesforceServicesEnabled(),
    serviceRating: isServiceRatingEnabled(),
  })

  return (
    <div className="w-full bg-background text-foreground">
      <HeaderWrapperClient />
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Política de cookies' },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 pb-20">
        <h1 className="mt-6 text-3xl font-medium leading-9 tracking-tight text-foreground">
          Política de cookies
        </h1>
        <p className="text-sm leading-5 text-foreground-light">
          Última atualização: {POLICY_UPDATED_AT}
        </p>

        <article className="mt-5 flex flex-col gap-8">
          <Section title="O que são cookies">
            <p>
              Cookies são pequenos arquivos de texto que um site grava no seu
              dispositivo (computador, celular ou tablet) quando você o visita.
              Eles permitem, por exemplo, manter você conectado, lembrar suas
              escolhas e medir como o site é usado. Esta política também vale
              para tecnologias parecidas, como o armazenamento local do
              navegador.
            </p>
            <p>
              Alguns cookies são gravados pelo próprio Pref.Rio (cookies
              próprios). Outros, por serviços de outras empresas que usamos no
              site (cookies de terceiros).
            </p>
          </Section>

          <Section title="Como usamos cookies">
            <p>
              Separamos os cookies em duas categorias. Os{' '}
              <strong className="font-medium text-foreground">
                necessários
              </strong>{' '}
              funcionam sem a sua escolha. Os de{' '}
              <strong className="font-medium text-foreground">análise</strong>{' '}
              ficam desligados até você permitir, e o script do Google Analytics
              não é carregado antes disso.
            </p>
            <p>
              Recusar os cookies de análise não impede o uso de nenhum serviço
              do Pref.Rio.
            </p>
            <p>
              O Pref.Rio{' '}
              <strong className="font-medium text-foreground">
                não usa cookies de publicidade
              </strong>{' '}
              e não usa os dados de navegação para exibir anúncios.
            </p>

            <Category
              title="Cookies necessários"
              status="Sempre ativos"
              purpose="Fazem o site funcionar: mantêm você conectado depois do login, guardam a sua escolha de cookies e lembram etapas de serviços que você está usando. Sem eles, áreas como a Carteira e Minhas solicitações não funcionam."
              legalBasis="Legítimo interesse (art. 7º, IX, da LGPD), limitado ao estritamente necessário para o funcionamento do site."
              sharing="Usados só pelo Pref.Rio. Não são compartilhados com terceiros."
              cookies={necessaryCookies}
            >
              <p>
                Ao entrar com a sua conta, o login acontece no Identidade
                Carioca e, se você escolher, no gov.br. Esses serviços gravam
                cookies próprios nos domínios deles, conforme as políticas
                deles.
              </p>
            </Category>

            <Category
              title="Cookies de análise (Google Analytics)"
              status="Só com a sua permissão"
              purpose="Medem, de forma estatística, quais páginas e serviços são mais acessados, por onde as pessoas chegam ao site e onde há erros, para melhorarmos o Pref.Rio. Também contamos quantos logins são feitos, sem enviar nome, CPF, e-mail ou outro dado que identifique você."
              legalBasis="Consentimento (art. 7º, I, da LGPD)."
              sharing="Google LLC, que trata os dados também nos Estados Unidos. Os dados de eventos ligados ao identificador do cookie ficam guardados pelo prazo de retenção configurado no Google Analytics (até 14 meses); relatórios estatísticos agregados podem ser mantidos por mais tempo."
              cookies={ANALYTICS_COOKIES}
            />
          </Section>

          <Section title="Armazenamento no seu navegador">
            <p>
              Algumas funcionalidades guardam informações só no seu navegador, e
              não em cookies. Esses dados ficam no seu dispositivo e não são
              enviados à Prefeitura nem a terceiros:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              {LOCAL_STORAGE_ITEMS.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Você pode apagar esses dados a qualquer momento limpando os dados
              do site nas configurações do navegador.
            </p>
          </Section>

          <Section title="Como mudar ou revogar sua escolha">
            <p>
              Você pode rever ou revogar o seu consentimento quando quiser, de
              graça e com a mesma facilidade com que o deu, pelo botão abaixo ou
              pelo link “Preferências de cookies” no rodapé de todas as páginas.
              Ao desligar uma categoria, apagamos do seu navegador os cookies
              das ferramentas dela.
            </p>
            <div>
              <CookiePreferencesButton appearance="button" />
            </div>

            <h3 className="text-base font-medium leading-6 text-foreground">
              Configurações do navegador
            </h3>
            <p>
              Você também pode bloquear ou apagar cookies pelo navegador.
              Bloquear todos os cookies, inclusive os necessários, pode impedir
              o login e o uso de alguns serviços.
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {BROWSER_HELP_LINKS.map(link => (
                <li key={link.label}>
                  <ExternalLink href={link.href}>{link.label}</ExternalLink>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Seus direitos">
            <p>
              Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você
              pode, entre outros direitos:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              {RIGHTS.map(right => (
                <li key={right}>{right}</li>
              ))}
            </ul>
          </Section>
        </article>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    // Mesmo espaçamento título → conteúdo dos Termos de uso (mt-1).
    <section>
      <h2 className="text-xl font-medium leading-7 text-foreground">{title}</h2>
      <div className="mt-1 flex flex-col gap-4 text-sm leading-5 text-foreground-light">
        {children}
      </div>
    </section>
  )
}

interface CategoryProps {
  title: string
  status: string
  purpose: string
  legalBasis: string
  sharing: string
  cookies: CookieInfo[]
  children?: ReactNode
}

function Category({
  title,
  status,
  purpose,
  legalBasis,
  sharing,
  cookies,
  children,
}: CategoryProps) {
  return (
    <section className="rounded-md border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-medium leading-6 text-foreground">
          {title}
        </h3>
        <span className="text-xs font-medium text-foreground">{status}</span>
      </div>
      {/* Mesmo espaçamento título → conteúdo das seções (mt-1). */}
      <div className="mt-1 flex flex-col gap-3">
        <dl className="flex flex-col gap-2">
          <div>
            <dt className="font-medium text-foreground">Para que servem</dt>
            <dd>{purpose}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Base legal</dt>
            <dd>{legalBasis}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Quem tem acesso</dt>
            <dd>{sharing}</dd>
          </div>
        </dl>
        {children}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{title}: lista de cookies</caption>
            <thead>
              <tr className="border-b text-foreground">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Cookie
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Para que serve
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Duração
                </th>
                <th scope="col" className="py-2 font-medium whitespace-nowrap">
                  Quem grava
                </th>
              </tr>
            </thead>
            <tbody>
              {cookies.map(cookie => (
                <tr
                  key={cookie.name}
                  className="border-b align-top last:border-b-0"
                >
                  <td className="py-2 pr-3 font-mono">{cookie.name}</td>
                  <td className="py-2 pr-3">{cookie.purpose}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {cookie.duration}
                  </td>
                  <td className="py-2 whitespace-nowrap">{cookie.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function ExternalLink({
  href,
  children,
}: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkCls}
    >
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  )
}

function getNecessaryCookies(flags: {
  salesforce: boolean
  serviceRating: boolean
}): CookieInfo[] {
  return [
    {
      name: 'access_token',
      purpose: 'Mantém você conectado depois do login.',
      duration: '10 horas',
      owner: 'Pref.Rio',
    },
    {
      name: 'refresh_token',
      purpose: 'Renova o login sem pedir a senha de novo.',
      duration: '30 minutos',
      owner: 'Pref.Rio',
    },
    {
      name: COOKIE_CONSENT_COOKIE,
      purpose:
        'Guarda a sua escolha de cookies, a data e a versão desta política.',
      duration: '12 meses',
      owner: 'Pref.Rio',
    },
    ...(flags.serviceRating
      ? [
          {
            name: VOTER_TOKEN_COOKIE,
            purpose:
              'Código aleatório, criado só quando você avalia um conteúdo (“Este conteúdo foi útil?”), para evitar votos repetidos. Não contém nome, CPF ou e-mail.',
            duration: '12 meses',
            owner: 'Pref.Rio',
          },
        ]
      : []),
    ...(flags.salesforce
      ? [
          {
            name: FORMULARIO_MARKER_COOKIE,
            purpose:
              'Lembra que você abriu um formulário de solicitação, para atualizar a lista de solicitações quando você voltar.',
            duration: '1 hora',
            owner: 'Pref.Rio',
          },
        ]
      : []),
  ]
}

const ANALYTICS_COOKIES: CookieInfo[] = [
  {
    name: '_ga',
    purpose:
      'Distingue visitantes por um código aleatório, para contar acessos sem identificar a pessoa.',
    duration: '2 anos',
    owner: 'Google Analytics',
  },
  {
    name: '_ga_<ID>',
    purpose: 'Mantém o estado da visita (sessão) para as estatísticas.',
    duration: '2 anos',
    owner: 'Google Analytics',
  },
  {
    name: LOGIN_MARKER_COOKIE,
    purpose:
      'Indica que um login acabou de ser feito, para contá-lo nas estatísticas. Não contém dados pessoais.',
    duration: '1 minuto',
    owner: 'Pref.Rio',
  },
]

const LOCAL_STORAGE_ITEMS = [
  'Tema claro ou escuro, quando você muda o tema.',
  'Preferências das ferramentas de acessibilidade e do tradutor de Libras (VLibras, do Governo Federal), quando você as usa.',
  'Suas buscas recentes e os cursos que você viu, para mostrar atalhos na busca.',
  'Avisos que você fechou, para não aparecerem de novo.',
  'Etapas de formulários em andamento e a página anterior, para o botão voltar. Esses itens são apagados quando você fecha a aba.',
]

const RIGHTS = [
  'confirmar se tratamos seus dados e acessá-los;',
  'corrigir dados incompletos, inexatos ou desatualizados;',
  'pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;',
  'saber com quais entidades seus dados são compartilhados;',
  'ser informado sobre a possibilidade de não dar consentimento e sobre as consequências da recusa;',
  'revogar o consentimento a qualquer momento e pedir a eliminação dos dados tratados com base nele;',
  'opor-se a tratamento feito com base em outra hipótese legal, se houver descumprimento da lei.',
]

const BROWSER_HELP_LINKS = [
  {
    label: 'Chrome',
    href: 'https://support.google.com/chrome/answer/95647?hl=pt-BR',
  },
  {
    label: 'Firefox',
    href: 'https://support.mozilla.org/pt-BR/kb/cookies-informacoes-sites-armazenam-no-computador',
  },
  {
    label: 'Edge',
    href: 'https://support.microsoft.com/pt-br/help/4027947/microsoft-edge-delete-cookies',
  },
  {
    label: 'Safari',
    href: 'https://support.apple.com/pt-br/guide/safari/sfri11471/mac',
  },
  {
    label: 'Opera',
    href: 'https://help.opera.com/en/latest/web-preferences/#cookies',
  },
]

/** Encarregado de Dados Geral do Município do Rio de Janeiro (SMIT). */
const DATA_PROTECTION_OFFICER = {
  role: 'Encarregado de Dados Geral do Município do Rio de Janeiro',
  name: 'Leonardo Costa Farias',
  email: 'lgpd.smit@prefeitura.rio',
}

const linkCls = 'text-primary underline underline-offset-4 hover:no-underline'

interface CookieInfo {
  name: string
  purpose: string
  duration: string
  owner: string
}

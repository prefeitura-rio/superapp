# Rastreamento de Login via Google Analytics

Contagem de logins do Pref Rio no Google Analytics 4, **sem dados pessoais** e **só com consentimento de análise**.

## Índice

- [Contexto e Motivação](#contexto-e-motivação)
- [Como Funciona](#como-funciona)
- [Implementação no Front-end](#implementação-no-front-end)
- [Estrutura do Evento](#estrutura-do-evento)
- [Configuração no Google Analytics](#configuração-no-google-analytics)
- [Como Verificar](#como-verificar)
- [Troubleshooting](#troubleshooting)

---

## Contexto e Motivação

A aplicação utiliza **Keycloak** (Identidade Carioca) como backend de autenticação e o **GovBR** como Identity Provider (IdP). Como o botão de login é externo (GovBR), não é possível adicionar um listener diretamente nele para capturar o momento do login.

**Solução adotada**: após o fluxo OAuth terminar no callback da aplicação, um evento `user_login` é disparado uma única vez para o Google Analytics.

> **Histórico (até novembro de 2026):** o evento enviava `name`, `preferred_username` (CPF) e `email`. Isso foi removido: os termos do Google Analytics proíbem dados pessoais identificáveis e a LGPD exige minimização (art. 6º, III) e consentimento para cookies de análise. **Não volte a enviar dados pessoais ao GA.** Veja [Configuração no Google Analytics](#configuração-no-google-analytics) para limpar o que já foi coletado.

---

## Como Funciona

### Fluxo Completo

```
Usuário clica em "Entrar"
        │
        ▼
Redirecionado para GovBR/Keycloak → autentica
        │
        ▼
Keycloak redireciona para /api/auth/callback/keycloak
        │
        ▼
┌─────────────────────────────────────────────────┐
│  Callback Route (server-side)                   │
│                                                 │
│  1. Troca o code por access_token e             │
│     refresh_token (cookies httpOnly)            │
│  2. Lê o cookie de consentimento                │
│     (prefrio_cookie_consent)                    │
│  3. Só com consentimento de análise: seta o     │
│     marcador "just_logged_in=1"                 │
│     (non-httpOnly, maxAge: 60s, sem dados)      │
│  4. Redireciona para a página de destino        │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  ConsentGatedAnalytics (client-side)            │
│                                                 │
│  Com consentimento de análise, monta o GA e,    │
│  logo depois, o LoginEventTracker:              │
│  1. Se o marcador "just_logged_in" existe:      │
│     a. Deleta o cookie imediatamente            │
│     b. Envia o evento "user_login"              │
│  2. Se não existe: não faz nada                 │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
        Google Analytics recebe o evento
```

### Garantias

- **Sem dados pessoais**: o marcador vale `1` e o evento só leva `page_path`, `user_authenticated`, `timestamp` e `debug_mode`.
- **Sem consentimento, nada acontece**: o marcador não é criado, o GA não é carregado e `sendEvent()` descarta o evento.
- **Exatamente 1 evento por login**: o cookie é deletado na primeira leitura, antes de enviar o evento.
- **Sem eventos em refresh de token**: o refresh não passa pelo callback.

---

## Implementação no Front-end

| Arquivo | Tipo | Responsabilidade |
|---------|------|------------------|
| `src/app/api/auth/callback/keycloak/route.ts` | API Route | Seta o marcador `just_logged_in=1`, só com consentimento de análise |
| `src/lib/analytics/login-marker.ts` | Constantes | Nome, valor e duração do marcador |
| `src/components/consent-gated-analytics.tsx` | Client Component | Monta GA → `LoginEventTracker` só com consentimento |
| `src/app/components/login-event-tracker.tsx` | Client Component | Consome o marcador e chama `trackUserLogin()` |
| `src/lib/analytics/tracker.ts` | Core | `trackUserLogin(pagePath)` e `sendEvent()` (checa consentimento) |

O `LoginEventTracker` é renderizado **depois** do `<GoogleAnalytics />` dentro do `ConsentGatedAnalytics`: o efeito do GA injeta o script de inicialização (que define `window.gtag`) antes do efeito do tracker.

---

## Estrutura do Evento

```json
{
  "user_authenticated": true,
  "page_path": "/",
  "timestamp": 1773874400000,
  "debug_mode": false
}
```

| Campo | Tipo | Origem | Descrição |
|-------|------|--------|-----------|
| `user_authenticated` | boolean | Hardcoded `true` | Sempre true (é um evento de login) |
| `page_path` | string | `usePathname()` | Página de destino após login |
| `timestamp` | number | `Date.now()` | Timestamp em milliseconds |
| `debug_mode` | boolean | `NODE_ENV` | true em dev, false em prod |

---

## Configuração no Google Analytics

O relatório de logins é só a contagem do evento `user_login` (Explore → Free form, métrica `Event count`, filtro `Event name = user_login`).

**Limpeza dos dados pessoais coletados antes da correção** (Admin da propriedade, feito por quem administra o GA, com o encarregado de dados):

1. **Admin → Custom definitions**: arquivar as dimensões `name`, `preferred_username` e `email`, se existirem.
2. **Admin → Data deletion requests**: pedir a exclusão dos parâmetros `name`, `preferred_username` e `email` do evento `user_login` de **18/03/2026** (commit `69a61fe96`) até a data do deploy da correção.
3. Remover relatórios/explorações que listavam esses campos.
4. Conferir cópias fora do GA: exportação para BigQuery (Admin → Vínculos de produtos), fontes do Looker Studio, planilhas e e-mails agendados. Apagar as que tiverem esses campos.

Faça nas duas propriedades: prod `G-6FY8VVMJ5T` e staging `G-0970HR3V20`.

---

## Como Verificar

### Em Desenvolvimento

1. Aceite os cookies de análise no banner (ou em "Preferências de cookies", no rodapé)
2. Faça login na aplicação
3. Após o redirect, procure no console:

```
[Analytics] Event sent: {
  event_name: "user_login",
  payload: { user_authenticated: true, page_path: "/", timestamp: 1773874400000, debug_mode: true }
}
```

### No GA4 DebugView / Realtime

Com consentimento de análise, faça login e procure o evento `user_login`.

---

## Troubleshooting

### Evento não aparece

1. **Sem consentimento de análise** (o esperado): confira o cookie `prefrio_cookie_consent` (Application → Cookies) e se `analytics` é `true`.
2. `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` não está configurado.
3. Bloqueador de ads interceptando o script do GA.

### Evento dispara mais de uma vez por login

- Em dev, o React StrictMode executa effects 2x (normal; não ocorre em produção).
- Verifique na aba Application → Cookies se o `just_logged_in` está sendo deletado.

---

**Última atualização**: Novembro 2026

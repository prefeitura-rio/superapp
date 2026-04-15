# Rastreamento de Login via Google Analytics

Sistema de rastreamento de eventos de login para o Pref Rio via Google Analytics 4.

## Índice

- [Contexto e Motivação](#contexto-e-motivação)
- [Como Funciona](#como-funciona)
- [Implementação no Front-end](#implementação-no-front-end)
- [Configuração no Google Analytics](#configuração-no-google-analytics)
- [Estrutura do Evento](#estrutura-do-evento)
- [Como Verificar](#como-verificar)
- [Troubleshooting](#troubleshooting)

---

## Contexto e Motivação

A aplicação utiliza **Keycloak** (Identidade Carioca) como backend de autenticação e o **GovBR** como Identity Provider (IdP). Como o botão de login é externo (GovBR), não é possível adicionar um listener diretamente nele para capturar o momento do login.

O Keycloak possui um sistema de "Events" que registra logins, mas essa funcionalidade não está disponível para uso por motivos internos.

**Solução adotada**: após o fluxo de autenticação OAuth ser concluído com sucesso no callback da aplicação, um evento `user_login` é disparado uma única vez para o Google Analytics com as informações do usuário.

---

## Como Funciona

### Fluxo Completo

```
Usuário clica em "Entrar"
        │
        ▼
Redirecionado para GovBR/Keycloak
        │
        ▼
Autentica com sucesso
        │
        ▼
Keycloak redireciona para /api/auth/callback/keycloak
        │
        ▼
┌─────────────────────────────────────────────────┐
│  Callback Route (server-side)                   │
│                                                 │
│  1. Troca o code por access_token e             │
│     refresh_token                               │
│  2. Seta cookies httpOnly (access_token,        │
│     refresh_token)                              │
│  3. Decodifica o JWT do access_token            │
│  4. Extrai name, preferred_username (CPF),      │
│     email                                       │
│  5. Formata o CPF (000.442.427-19)              │
│  6. Seta cookie "just_logged_in"                │
│     (non-httpOnly, maxAge: 60s)                 │
│  7. Redireciona para a página de destino        │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  LoginEventTracker (client-side)                │
│                                                 │
│  1. Componente montado globalmente no           │
│     root layout                                 │
│  2. useEffect verifica se o cookie              │
│     "just_logged_in" existe                     │
│  3. Se existe:                                  │
│     a. Deleta o cookie imediatamente            │
│     b. Decodifica o conteúdo (base64 → JSON)    │
│     c. Envia evento "user_login" para o GA      │
│  4. Se não existe: não faz nada                 │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
        Google Analytics recebe o evento
        com payload flat (1 nível)
```

### Garantias

- **Exatamente 1 evento por login**: o cookie é deletado na primeira leitura, antes mesmo de enviar o evento.
- **Sem eventos em refresh de token**: o middleware de refresh de token não passa pelo callback, então o cookie nunca é criado novamente.
- **Sem eventos em navegação normal**: o cookie só é criado no callback de autenticação.
- **Tolerante a falhas**: se o decode do JWT falhar, o login continua normalmente (o cookie de analytics simplesmente não é criado).

---

## Implementação no Front-end

### Arquivos Envolvidos

| Arquivo | Tipo | Responsabilidade |
|---------|------|------------------|
| `src/app/api/auth/callback/keycloak/route.ts` | API Route | Seta o cookie `just_logged_in` com dados do JWT |
| `src/app/components/login-event-tracker.tsx` | Client Component | Lê o cookie, dispara o evento GA, deleta o cookie |
| `src/lib/analytics/types.ts` | Tipos | Define `UserLoginParams` e `AnalyticsEventType.USER_LOGIN` |
| `src/lib/analytics/tracker.ts` | Core | Função `trackUserLogin()` que envia o evento via `window.gtag` |
| `src/lib/analytics/index.ts` | Barrel | Re-exporta tipos e funções |
| `src/app/layout.tsx` | Root Layout | Monta o `<LoginEventTracker />` globalmente |

### 1. Callback Route (`/api/auth/callback/keycloak`)

Após trocar o authorization code por tokens com sucesso, o callback:

1. Decodifica o `access_token` (JWT) usando `jwt-decode`
2. Extrai `name`, `preferred_username` e `email`
3. Formata o CPF com pontos e traço (`000.442.427-19`) para evitar que o GA4 trate como número e corte zeros à esquerda
4. Cria um JSON com esses dados e codifica em base64
5. Seta o cookie `just_logged_in` com as seguintes configurações:

| Propriedade | Valor | Motivo |
|-------------|-------|--------|
| `httpOnly` | `false` | Precisa ser lido por JavaScript no client |
| `maxAge` | `60` (segundos) | Expira rápido por segurança |
| `secure` | `true` em produção | HTTPS only em prod |
| `sameSite` | `lax` | Proteção contra CSRF |
| `path` | `/` | Disponível em qualquer página |

**Formatação do CPF:**

```typescript
function formatCpf(raw: string): string {
  const digits = raw.replace(/\D/g, '').padStart(11, '0')
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}
// "00044242719" → "000.442.427-19"
// "14729395735" → "147.293.957-35"
```

O CPF é formatado como string com caracteres especiais para que o GA4 não interprete como número (o que cortaria zeros à esquerda).

### 2. LoginEventTracker (Client Component)

Componente React montado no root layout que:

1. Usa `useEffect` com dependência em `pathname`
2. Lê o cookie `just_logged_in` via `document.cookie`
3. Deleta o cookie imediatamente (antes de enviar o evento)
4. Decodifica: `decodeURIComponent` → `atob` (base64) → `JSON.parse`
5. Chama `trackUserLogin()` com os dados

### 3. Analytics Module

O evento `user_login` segue a mesma arquitetura do módulo de analytics existente:

- `types.ts`: Define `UserLoginParams` (interface) e `AnalyticsEventType.USER_LOGIN` (enum)
- `tracker.ts`: Implementa `trackUserLogin()` com sanitização de parâmetros
- O `sendEvent()` faz spread do `event_params` no payload raiz, resultando em um JSON flat

---

## Configuração no Google Analytics

### Passo 1: Registrar Custom Dimensions

Os parâmetros `name`, `preferred_username` e `email` são parâmetros customizados. O GA4 precisa que eles sejam registrados como **Custom Dimensions** para aparecerem nos relatórios.

1. Acesse o [Google Analytics](https://analytics.google.com/)
2. Selecione a property correta
3. Vá em **Admin** → **Custom definitions**
4. Clique em **Create custom dimension** e crie 3 dimensões:

| Dimension name | Scope | Event parameter |
|----------------|-------|-----------------|
| `preferred_username` | Event | `preferred_username` |
| `name` | Event | `name` |
| `email` | Event | `email` |

> **Importante**: Leva **24-48 horas** para as dimensões começarem a popular com dados. Eventos enviados antes do registro são perdidos para essas dimensões.

### Passo 2: Criar Relatório (Explorations)

Após as dimensões estarem ativas:

1. Vá em **Explore** → **Blank**
2. Dê um nome: `Registros de Login`
3. Em **Dimensions**, adicione:
   - `Date` (ou `Date + hour of day`)
   - `Event name`
   - `preferred_username` (Custom)
   - `name` (Custom)
   - `email` (Custom)
4. Em **Metrics**, adicione:
   - `Event count`
5. Em **Tab Settings**:
   - **Technique**: Free form
   - **Rows**: `Date`, `preferred_username`, `name`, `email`
   - **Values**: `Event count`
   - **Filters**: `Event name` exactly matches `user_login`

### Resultado Esperado

| Date | preferred_username | name | email | Event count |
|------|--------------------|------|-------|-------------|
| 2026-03-18 | 147.293.957-35 | LUCAS TAVARES DA SILVA FERREIRA | lucastavarestt@gmail.com | 1 |
| 2026-03-18 | 000.442.427-19 | MARIA DA SILVA | maria@email.com | 1 |

---

## Estrutura do Evento

### Payload enviado ao GA4

O evento é enviado com todos os campos em um único nível (flat):

```json
{
  "name": "LUCAS TAVARES DA SILVA FERREIRA",
  "preferred_username": "147.293.957-35",
  "email": "lucastavarestt@gmail.com",
  "user_authenticated": true,
  "page_path": "/",
  "timestamp": 1773874400000,
  "debug_mode": false
}
```

### Campos

| Campo | Tipo | Origem | Descrição |
|-------|------|--------|-----------|
| `name` | string | JWT `name` | Nome completo do usuário |
| `preferred_username` | string | JWT `preferred_username` | CPF formatado (XXX.XXX.XXX-XX) |
| `email` | string | JWT `email` | Email do usuário |
| `user_authenticated` | boolean | Hardcoded `true` | Sempre true (é um evento de login) |
| `page_path` | string | `usePathname()` | Página de destino após login |
| `timestamp` | number | `Date.now()` | Timestamp em milliseconds |
| `debug_mode` | boolean | `NODE_ENV` | true em dev, false em prod |

---

## Como Verificar

### Em Desenvolvimento (imediato)

1. Abra o **DevTools** do navegador (F12) → aba **Console**
2. Faça login na aplicação
3. Após o redirect, procure no console:

```
[Analytics] Event sent: {
  event_name: "user_login",
  payload: {
    name: "LUCAS TAVARES DA SILVA FERREIRA",
    preferred_username: "147.293.957-35",
    email: "lucastavarestt@gmail.com",
    user_authenticated: true,
    page_path: "/",
    timestamp: 1773874400000,
    debug_mode: true
  }
}
```

### No GA4 DebugView (imediato)

1. Vá em **Admin** → **DebugView**
2. Faça login na aplicação
3. Procure o evento `user_login`
4. Clique nele para ver os parâmetros

### No GA4 Realtime (imediato)

1. Vá em **Reports** → **Realtime**
2. Faça login na aplicação
3. Veja `user_login` no card "Event count by Event name"

### No GA4 Explorations (após 24-48h)

Após registrar as custom dimensions e esperar o tempo de processamento, os dados estarão disponíveis no relatório criado no Passo 2 da configuração.

---

## Troubleshooting

### Evento não aparece no console

**Possíveis causas:**

1. `window.gtag` não carregou a tempo (race condition)
2. `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` não está configurado
3. Bloqueador de ads interceptando o script do GA

**Soluções:**

- Verifique se `window.gtag` existe no console do navegador
- Verifique o `.env` tem `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` preenchido
- Desabilite extensões de bloqueio temporariamente

### CPF aparece sem zeros à esquerda no GA

**Causa:** O GA4 interpreta valores numéricos como número, cortando zeros à esquerda.

**Solução (já implementada):** O CPF é formatado com pontos e traço (`000.442.427-19`) no callback route, forçando o GA4 a tratar como string.

### Evento dispara mais de uma vez por login

**Possíveis causas:**

1. React StrictMode em desenvolvimento (executa effects 2x - **normal**)
2. Bug no cookie não sendo deletado

**Soluções:**

- Em dev: ignorar duplicatas do StrictMode (não ocorre em produção)
- Verificar na aba Application → Cookies se o `just_logged_in` está sendo deletado

### Cookie `just_logged_in` não aparece

**Possíveis causas:**

1. Erro no decode do JWT (catch silencioso no callback)
2. `btoa()` falhou com caracteres não-Latin1

**Soluções:**

- Adicionar log temporário no catch do callback para investigar
- Verificar o terminal do Next.js por erros durante o callback

---

**Última atualização**: Março 2026

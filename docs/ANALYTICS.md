# 📊 Google Analytics - Rastreamento de Eventos

Sistema de rastreamento de eventos do Google Analytics para o superapp Pref Rio.

## Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#️-arquitetura)
- [Implementação](#-implementação)
- [Estrutura de Eventos](#-estrutura-de-eventos)
- [Como Verificar](#-como-verificar)
- [Privacidade e Segurança](#-privacidade-e-segurança)
- [Testes](#-testes)
- [Próximos Passos](#-próximos-passos)
- [Referências](#-referências)
- [Troubleshooting](#-troubleshooting)

---

## Visão Geral

Este módulo implementa rastreamento de eventos do Google Analytics de forma **type-safe**, **modular** e **compatível com SSR** (Server-Side Rendering).

### Status Atual: POC (Proof of Concept)

- **Implementado**: Rastreamento de cliques em botões de serviços

### Objetivos

1. Rastrear cliques em botões de ação de serviços públicos
2. Coletar automaticamente contexto do usuário (autenticação, navegação)
3. Validar integração com Google Analytics 4 existente
4. Estabelecer arquitetura escalável para futuros eventos
5. Garantir privacidade (sem rastreamento de PII)

---

## Arquitetura

### Estrutura de Arquivos

```
src/
├── lib/analytics/              # Módulo principal de analytics
│   ├── index.ts               # API pública (barrel exports)
│   ├── types.ts               # Definições TypeScript e enums
│   ├── config.ts              # Configuração e feature flags
│   ├── tracker.ts             # Wrapper do gtag (core)
│   └── context-collector.ts   # Coleta e sanitização de dados
│
├── hooks/
│   └── useAnalytics.ts        # Hook React para componentes
│
└── docs/
    └── ANALYTICS.md           # Este arquivo
```

### Diagrama de Módulos

```
┌─────────────────────────────────────────────────────┐
│                  React Component                     │
│              (page-client.tsx, etc.)                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ usa
                       ▼
          ┌────────────────────────┐
          │   useAnalytics Hook    │
          │                        │
          │  • Auto-coleta auth    │
          │  • Auto-coleta path    │
          │  • API type-safe       │
          └───────────┬────────────┘
                      │
                      │ chama
                      ▼
          ┌────────────────────────┐
          │   Tracker Functions    │
          │                        │
          │  • trackServiceClick   │
          │  • sendEvent           │
          └───────────┬────────────┘
                      │
                      │ usa
                      ▼
          ┌────────────────────────┐
          │  Context Collectors    │
          │                        │
          │  • sanitizeParam       │
          │  • getTimestamp        │
          └───────────┬────────────┘
                      │
                      │ envia para
                      ▼
          ┌────────────────────────┐
          │    window.gtag()       │
          │  (Google Analytics)    │
          └────────────────────────┘
```

### Princípios de Design

1. **Modular**: Cada arquivo tem responsabilidade única e bem definida
2. **Type-Safe**: TypeScript strict mode, autocomplete em toda parte
3. **SSR-Safe**: Guards `typeof window !== 'undefined'` em pontos críticos
4. **Privacy-First**: Sanitização automática, sem rastreamento de PII
5. **Testável**: Funções puras, sem side effects desnecessários
6. **Extensível**: Fácil adicionar novos tipos de eventos

---

## Implementação

### Uso Básico em Componentes

```tsx
import { useAnalytics } from '@/hooks/useAnalytics'

function ServiceButton({ service, button }) {
  const { trackServiceClick } = useAnalytics()

  const handleClick = () => {
    trackServiceClick({
      service_id: service.id || '',
      service_name: service.nome_servico,
      service_category: service.tema_geral,
      button_label: button.titulo || '',
      button_index: 0,
      destination_url: button.url_service || '',
    })
  }

  return (
    <a
      href={button.url_service}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {button.titulo}
    </a>
  )
}
```

### Exemplo Completo - Múltiplos Botões

```tsx
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import type { ModelsButton, ModelsPrefRioService } from '@/http-busca-search/models'

interface ServicePageProps {
  serviceData: ModelsPrefRioService
}

export function ServicePage({ serviceData }: ServicePageProps) {
  const { trackServiceClick } = useAnalytics()
  const buttons = serviceData?.buttons || []
  const enabledButtons = buttons.filter(btn => btn.is_enabled)

  const handleButtonClick = (button: ModelsButton, index: number) => {
    trackServiceClick({
      service_id: serviceData.id || '',
      service_name: serviceData.nome_servico,
      service_category: serviceData.tema_geral,
      button_label: button.titulo || '',
      button_index: index,
      destination_url: button.url_service || '',
    })
  }

  return (
    <div>
      <h1>{serviceData.nome_servico}</h1>

      {enabledButtons.map((button, index) => (
        <a
          key={index}
          href={button.url_service}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleButtonClick(button, index)}
        >
          {button.titulo}
        </a>
      ))}
    </div>
  )
}
```

### O que o Hook Faz Automaticamente

O `useAnalytics` coleta automaticamente:

- ✅ **Status de autenticação** (`isLoggedIn`) - Do `AuthStatusProvider`
- ✅ **Pathname atual** (`pathname`) - Do `usePathname()` do Next.js
- ✅ **Timestamp** - Gerado no momento do evento

Você só precisa fornecer os **parâmetros específicos do serviço**.

---

## Estrutura de Eventos

### Evento: `service_button_click`

Quando um usuário clica em um botão de serviço, o seguinte evento é enviado ao Google Analytics:

```javascript
{
  // Nome do evento
  event_name: 'service_button_click',

  // Contexto automático (coletado pelo hook)
  user_authenticated: true,              // boolean | null
  page_path: '/servicos/categoria/familia/cadrio-agendamento-770618f7',
  timestamp: 1678901234567,

  // Parâmetros específicos do serviço
  service_id: '770618f7',                // ID do serviço
  service_name: 'Agendamento CADRIO',    // Nome do serviço
  service_category: 'familia',           // Categoria (dinâmica)
  button_label: 'Acessar serviço',       // Texto do botão
  button_index: 0,                       // Posição do botão (0-based)
  destination_url: 'https://servicos.prefeitura.rio/cadrio',
}
```

### Campos Detalhados

| Campo | Tipo | Origem | Descrição |
|-------|------|--------|-----------|
| `event_name` | string | Automático | Sempre `'service_button_click'` |
| `user_authenticated` | boolean \| null | `useAuthStatus()` | Status de autenticação do usuário |
| `page_path` | string | `usePathname()` | Caminho da página atual |
| `timestamp` | number | `Date.now()` | Timestamp em milliseconds |
| `service_id` | string | `serviceData.id` | ID único do serviço |
| `service_name` | string | `serviceData.nome_servico` | Nome do serviço |
| `service_category` | string | `serviceData.tema_geral` | Categoria (familia, transporte, etc.) |
| `button_label` | string | `button.titulo` | Texto exibido no botão |
| `button_index` | number | índice do array | Posição do botão (0, 1, 2...) |
| `destination_url` | string | `button.url_service` | URL de destino do botão |

### Categorias Dinâmicas

As categorias (`service_category`) são **dinâmicas** e vêm do backend via campo `tema_geral`. Exemplos comuns:

- `"familia"` - Serviços para família
- `"transporte"` - Multas, IPVA, etc.
- `"educacao"` - Matrículas, certificados
- `"saude"` - Agendamentos, vacinas
- `"trabalho"` - Empregos, MEI

**Não há categorias hard-coded no código.**

---

## ✅ Como Verificar

### 1. No Console do Navegador (Desenvolvimento)

Em modo desenvolvimento, os eventos são automaticamente logados no console:

```javascript
// Abra DevTools → Console
// Clique em um botão de serviço
// Você verá:

[Analytics] Event sent: {
  event_name: 'service_button_click',
  payload: {
    service_id: '770618f7',
    service_name: 'Agendamento CADRIO',
    service_category: 'familia',
    button_label: 'Acessar serviço',
    button_index: 0,
    destination_url: 'https://...',
    user_authenticated: true,
    page_path: '/servicos/categoria/familia/...',
    timestamp: 1678901234567
  }
}
```

### 2. Google Analytics DebugView

**Passo a passo:**

1. Acesse: [Google Analytics](https://analytics.google.com/) → **Admin** → **DebugView**
2. Filtre por seu dispositivo de desenvolvimento
3. Navegue até uma página de serviço (ex: `/servicos/categoria/familia/cadrio-agendamento-770618f7`)
4. Clique em botões de serviço
5. Veja os eventos aparecerem em tempo real (2-3 segundos de latência)

**Validações:**

- ✅ Evento `service_button_click` aparece
- ✅ Todos os parâmetros estão presentes
- ✅ Tipos de dados corretos (string, number, boolean)
- ✅ Valores fazem sentido (nomes de serviços corretos, etc.)

### 3. Google Tag Assistant (Extensão Chrome)

1. Instale: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Ative a extensão
3. Navegue até uma página de serviço
4. Clique em botões
5. Veja eventos capturados pela extensão

---

## 🔒 Privacidade e Segurança

### Dados PERMITIDOS para Rastreamento

✅ **Pode rastrear:**

- IDs de serviços (anônimos, públicos)
- Nomes de serviços (informação pública)
- Categorias de serviços (públicas)
- Textos de botões (públicos)
- URLs de destino (públicas)
- Status de autenticação (boolean, sem identificação pessoal)
- Pathname (sem query parameters)

### Dados PROIBIDOS (PII - Personally Identifiable Information)

❌ **NUNCA rastrear:**

- CPF, RG, CNH, ou qualquer documento pessoal
- Email, telefone, endereço
- Nome completo do usuário
- Dados sensíveis de formulários
- Query parameters com dados pessoais
- Cookies de sessão ou tokens

### Sanitização Automática

Todos os parâmetros de string passam automaticamente por `sanitizeParam()`:

```typescript
// Exemplo de sanitização
sanitizeParam('A'.repeat(150), 100)
// Retorna: 'AAA...AAA' (100 chars total, truncado)

sanitizeParam('  Hello World  ')
// Retorna: 'Hello World' (whitespace removido)

sanitizeParam('')
// Retorna: '' (valores vazios retornam string vazia)
```

**Proteções:**

1. Truncamento em 100 caracteres (configurável)
2. Remoção de whitespace extra
3. Validação de tipo
4. Fallback para string vazia se inválido

**⚠️ Importante**: A sanitização ajuda, mas **desenvolvedores devem garantir** que dados sensíveis nunca sejam passados para funções de tracking.

---

## 🧪 Testes

### Teste Manual - Passo a Passo

**Pré-requisitos:**

- Servidor dev rodando: `npm run dev`
- DevTools aberto no navegador
- Console visível

**Passos:**

1. Navegue para uma página de serviço:
   ```
   http://localhost:3000/servicos/categoria/familia/cadrio-agendamento-770618f7
   ```

2. Abra **DevTools** → **Console**

3. Clique no botão **"Acessar serviço"**

4. **Verificar no console**:
   ```
   [Analytics] Event sent: { ... }
   ```

5. **Validar payload**:
   - ✅ `event_name` = `'service_button_click'`
   - ✅ `service_id` presente e não vazio
   - ✅ `service_name` correto
   - ✅ `service_category` = `'familia'`
   - ✅ `button_label` = texto do botão
   - ✅ `button_index` = `0` (primeiro botão)
   - ✅ `user_authenticated` = `true` ou `false`
   - ✅ `page_path` = pathname correto
   - ✅ `timestamp` = número (milliseconds)

### Casos de Teste

**Checklist:**

- [ ] Clique em botão único (1 botão habilitado)
- [ ] Clique em múltiplos botões (2+ botões habilitados)
- [ ] Clique em cada botão de um serviço com múltiplos botões (verificar `button_index`)
- [ ] Usuário **autenticado** (verificar `user_authenticated: true`)
- [ ] Usuário **não autenticado** (verificar `user_authenticated: false`)
- [ ] Diferentes categorias (familia, transporte, educacao, saude, trabalho)
- [ ] Serviço com campos opcionais faltando (ex: `service_id` vazio)
- [ ] Nomes de serviço longos (verificar truncamento)
- [ ] URLs longas (verificar truncamento)

### Testes em Diferentes Ambientes

**Development (`npm run dev`):**

- Console logging ativo
- Eventos aparecem no console
- Debugging fácil

**Production (`npm run build && npm start`):**

- Console logging desativado
- Eventos enviados normalmente
- Sem logs no console (exceto erros)

---

## 🚀 Próximos Passos

### Fase 2: Expansão de Eventos (Futuro)

Após validação da POC, adicionar novos tipos de eventos:

#### 1. Page Views

```typescript
// Em types.ts
export enum AnalyticsEventType {
  SERVICE_BUTTON_CLICK = 'service_button_click',
  PAGE_VIEW = 'page_view',  // NOVO
}

// Em tracker.ts
export function trackPageView(
  pagePath: string,
  pageTitle: string,
  userAuthenticated: boolean | null
): boolean {
  // Implementação
}

// Em useAnalytics.ts
export function useAnalytics() {
  // ...
  const trackPageView = useCallback((...) => { ... }, [])

  return {
    trackServiceClick,
    trackPageView,  // NOVO
  }
}
```

#### 2. Buscas

```typescript
SEARCH = 'search',

export interface SearchEventParams {
  search_term: string
  search_category?: string
  results_count: number
}
```

#### 3. Conversões

```typescript
CONVERSION = 'conversion',

export interface ConversionEventParams {
  conversion_type: string
  service_id: string
  value?: number
}
```

### Arquitetura Extensível

Para adicionar um novo tipo de evento:

1. **Adicionar enum** em `types.ts`:
   ```typescript
   export enum AnalyticsEventType {
     // ...
     NEW_EVENT = 'new_event',
   }
   ```

2. **Criar interface de params** em `types.ts`:
   ```typescript
   export interface NewEventParams {
     param1: string
     param2: number
   }
   ```

3. **Adicionar função de tracking** em `tracker.ts`:
   ```typescript
   export function trackNewEvent(
     params: NewEventParams,
     userAuthenticated: boolean | null,
     pagePath: string
   ): boolean {
     // Sanitizar params
     // Criar evento
     // Enviar
   }
   ```

4. **Expor no hook** em `useAnalytics.ts`:
   ```typescript
   const trackNewEvent = useCallback((...) => { ... }, [...])
   ```

5. **Documentar** neste arquivo (ANALYTICS.md)

---

## 📚 Referências

### Google Analytics 4

- [GA4 Events Documentation](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Custom Events Guide](https://developers.google.com/analytics/devguides/collection/ga4/events?client_type=gtag#send_events)
- [Event Parameters](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters)

### Next.js

- [Google Analytics Integration](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)
- [@next/third-parties](https://www.npmjs.com/package/@next/third-parties)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

---

## 🐛 Troubleshooting

### Problema: Eventos não aparecem no console

**Sintomas:**

- Clico em botões mas não vejo `[Analytics] Event sent` no console

**Possíveis Causas:**

1. Não está em modo desenvolvimento
2. Console filtrado (verificar filtros do DevTools)
3. Erro silencioso na execução

**Soluções:**

```bash
# 1. Verificar modo de desenvolvimento
echo $NODE_ENV  # Deve retornar 'development'

# 2. Limpar cache e reiniciar
rm -rf .next
npm run dev

# 3. Verificar erros no console
# Procure por [Analytics] ERROR ou warnings
```

---

### Problema: Eventos não aparecem no Google Analytics

**Sintomas:**

- Vejo eventos no console, mas não aparecem no GA DebugView

**Possíveis Causas:**

1. `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` não configurado
2. Bloqueador de ads ativo
3. gtag não carregado
4. Filtros incorretos no GA

**Soluções:**

```bash
# 1. Verificar variável de ambiente
# Arquivo: .env.local
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# 2. Desabilitar bloqueador de ads temporariamente

# 3. Verificar no console do navegador
window.gtag
// Deve retornar: ƒ () { ... }
// Se undefined, gtag não carregou

# 4. Verificar src/app/layout.tsx
# Deve ter:
// <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''} />
```

---

### Problema: Eventos duplicados

**Sintomas:**

- Cada clique gera 2 eventos no console ou no GA

**Causa:**

- React **StrictMode** em desenvolvimento

**Explicação:**

Em desenvolvimento, o React StrictMode executa efeitos duas vezes intencionalmente para detectar problemas. Isso é **comportamento normal**.

**Soluções:**

- ✅ **Desenvolvimento**: Ignorar duplicatas (esperado)
- ✅ **Produção**: Eventos não duplicam (StrictMode desabilitado)
- ✅ **GA**: Deduplica automaticamente eventos idênticos

**Não é um bug!**

---

### Problema: `service_category` vazio

**Sintomas:**

- Evento enviado com `service_category: ""`

**Possíveis Causas:**

1. `serviceData.tema_geral` está `undefined` ou `null`
2. Serviço sem categoria configurada no backend
3. API retornou dados incompletos

**Soluções:**

```typescript
// Validar dados antes de rastrear (opcional)
if (!serviceData.tema_geral) {
  console.warn('[Analytics] Service category missing:', serviceData)
}

// Ou usar fallback
service_category: serviceData.tema_geral || 'sem_categoria',
```

**Impacto:**

- ✅ Tracking não quebra
- ⚠️ Análise fica incompleta (falta categoria)
- 🔧 Corrigir no backend/API

---

### Problema: gtag is not defined

**Sintomas:**

- Console error: `[Analytics] gtag not found on window object`

**Possíveis Causas:**

1. GoogleAnalytics component não está em `layout.tsx`
2. Script do GA bloqueado
3. GA ID inválido ou vazio

**Soluções:**

```tsx
// 1. Verificar src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

// 2. Verificar .env.local
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX  // Formato correto

// 3. Aguardar carregamento completo da página
// gtag carrega assincronamente, pode levar alguns segundos
```

---

### Problema: TypeScript errors após instalação

**Sintomas:**

- Erros de tipo ao importar `useAnalytics` ou tipos do módulo

**Soluções:**

```bash
# 1. Recompilar TypeScript
npm run build

# 2. Reiniciar TypeScript server (VS Code)
# Command Palette (Cmd+Shift+P ou Ctrl+Shift+P)
# > TypeScript: Restart TS Server

# 3. Limpar cache
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

## 📝 Notas Finais

### Manutenção

Este módulo de analytics deve ser mantido por desenvolvedores familiarizados com:

- TypeScript
- React Hooks
- Next.js App Router
- Google Analytics 4

### Contribuindo

Ao adicionar novos eventos:

1. Seguir os padrões existentes
2. Documentar JSDoc em inglês (código)
3. Documentar em português (ANALYTICS.md)
4. Adicionar testes manuais na seção de testes
5. Validar no GA DebugView antes de fazer merge

### Suporte

- **Código**: Verifique JSDoc nos arquivos do módulo analytics
- **Documentação**: Este arquivo (ANALYTICS.md)
- **Issues**: Reporte bugs ou problemas via sistema de tickets do projeto

---

**Última atualização**: Março 2026
**Versão**: 1.0.0 (POC)
**Status**: Produção (POC validada)

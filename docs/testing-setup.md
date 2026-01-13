# Testing Setup

Configuracao e infraestrutura de testes da aplicacao citizen-portal.

## Indice

1. [Stack de Testes](#1-stack-de-testes)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Configuracao do Vitest](#3-configuracao-do-vitest)
4. [Setup Global](#4-setup-global)
   - 4.1. [Jest-DOM Matchers](#41-jest-dom-matchers)
   - 4.2. [Variaveis de Ambiente](#42-variaveis-de-ambiente)
   - 4.3. [Mocks do Next.js](#43-mocks-do-nextjs)
   - 4.4. [Mock de Autenticacao](#44-mock-de-autenticacao)
   - 4.5. [Servidor MSW](#45-servidor-msw)
5. [Handlers MSW](#5-handlers-msw)
6. [Comandos](#6-comandos)
7. [Padroes de Teste](#7-padroes-de-teste)
   - 7.1. [Sobrescrevendo Handlers](#71-sobrescrevendo-handlers)
   - 7.2. [Mockando Modulos](#72-mockando-modulos)
   - 7.3. [Fixtures](#73-fixtures)
   - 7.4. [Convencao de Nomes](#74-convencao-de-nomes)
8. [Guia de Boas Praticas](#8-guia-de-boas-praticas)
   - 8.1. [Estrutura do Teste (AAA)](#81-estrutura-do-teste-aaa)
   - 8.2. [Interacoes com userEvent](#82-interacoes-com-userevent)
   - 8.3. [Queries do Testing Library](#83-queries-do-testing-library)
   - 8.4. [Testes Assincronos](#84-testes-assincronos)
   - 8.5. [Isolamento de Testes](#85-isolamento-de-testes)
   - 8.6. [Testes Unitarios vs Integracao](#86-testes-unitarios-vs-integracao)
   - 8.7. [O que Testar](#87-o-que-testar)
   - 8.8. [Anti-patterns a Evitar](#88-anti-patterns-a-evitar)

---

## 1. Stack de Testes

| Ferramenta | Versao | Proposito |
|------------|--------|-----------|
| Vitest | ^3.2.4 | Test runner principal |
| Testing Library | ^16.3.1 | Testes de componentes React |
| MSW | ^2.12.7 | Mock de requisicoes HTTP |
| jsdom | ^27.0.1 | Ambiente DOM para testes |

---

## 2. Estrutura de Arquivos

```
src/
├── test/                           # Infraestrutura de testes
│   ├── setup.ts                    # Setup global do Vitest
│   ├── setup.test.ts               # Teste de verificacao do setup
│   └── mocks/
│       ├── env.ts                  # Variaveis de ambiente de teste
│       ├── handlers.ts             # Handlers MSW para APIs
│       └── server.ts               # Servidor MSW
│
├── lib/__tests__/                  # Testes unitarios de utilitarios
├── actions/__tests__/              # Testes de server actions
├── actions/courses/__tests__/      # Testes de actions de cursos
├── actions/mei/__tests__/          # Testes de actions MEI
└── app/.../__tests__/              # Testes de integracao de componentes
```

---

## 3. Configuracao do Vitest

Arquivo: `vitest.config.ts`

```typescript
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', '.next', 'src/test', '**/*.d.ts', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## 4. Setup Global

Arquivo: `src/test/setup.ts`

O setup global configura os seguintes itens:

### 4.1. Jest-DOM Matchers

```typescript
import '@testing-library/jest-dom/vitest'
```

Adiciona matchers como `toBeInTheDocument()`, `toBeDisabled()`, `toHaveTextContent()`, etc.

### 4.2. Variaveis de Ambiente

```typescript
import { setupTestEnv } from './mocks/env'
setupTestEnv()
```

Configura as URLs base das APIs para testes:

| Variavel | Valor de Teste |
|----------|----------------|
| `NEXT_PUBLIC_BASE_API_URL_RMI` | `http://localhost:3001` |
| `NEXT_PUBLIC_COURSES_BASE_API_URL` | `http://localhost:3002` |
| `NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH` | `http://localhost:3003` |
| `NEXT_PUBLIC_BASE_API_URL_SUBPAV_OSA_API` | `http://localhost:3004` |

### 4.3. Mocks do Next.js

```typescript
// next/cache
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'access_token') {
        return { value: 'mock-access-token' }
      }
      return undefined
    }),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Headers()),
}))
```

### 4.4. Mock de Autenticacao

```typescript
vi.mock('@/lib/user-info', () => ({
  getUserInfoFromToken: vi.fn().mockResolvedValue({
    cpf: '12345678901',
    name: 'Test User',
  }),
}))
```

### 4.5. Servidor MSW

```typescript
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
```

---

## 5. Handlers MSW

Arquivo: `src/test/mocks/handlers.ts`

Handlers padrao para as APIs:

```typescript
export const handlers = [
  // RMI - Atualizacao de telefone
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/phone`, () => {
    return HttpResponse.json({ message: 'Success' }, { status: 200 })
  }),

  // RMI - Validacao de token de telefone
  http.post(`${RMI_BASE_URL}/v1/citizen/:cpf/phone/validate`, () => {
    return HttpResponse.json({ validated: true }, { status: 200 })
  }),

  // RMI - Atualizacao de email
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/email`, () => {
    return HttpResponse.json({ message: 'Success' }, { status: 200 })
  }),

  // RMI - Atualizacao de endereco
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/address`, () => {
    return HttpResponse.json({ message: 'Success' }, { status: 200 })
  }),

  // Cursos - Inscricao
  http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
    return HttpResponse.json(
      { id: 'enrollment-123', status: 'enrolled' },
      { status: 201 }
    )
  }),

  // MEI - Submissao de proposta
  http.post(`${COURSES_BASE_URL}/api/v1/oportunidades-mei/:id/propostas`, () => {
    return HttpResponse.json(
      { id: 'proposal-123', status: 'submitted' },
      { status: 201 }
    )
  }),
]
```

---

## 6. Comandos

```bash
# Rodar testes em modo watch
npm test

# Rodar testes uma vez
npm run test:run

# Rodar com cobertura
npm run test:coverage
```

---

## 7. Padroes de Teste

### 7.1. Sobrescrevendo Handlers

Para simular erros ou respostas especificas:

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

test('handles API error', async () => {
  server.use(
    http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/phone`, () => {
      return HttpResponse.json(
        { error: 'Numero de telefone invalido' },
        { status: 400 }
      )
    })
  )

  // ... teste
})
```

### 7.2. Mockando Modulos

Para testes de integracao de componentes:

```typescript
// Mock de navegacao
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock de notificacoes
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))
```

### 7.3. Fixtures

Para testes de integracao, use fixtures organizadas:

```
__tests__/
├── fixtures/
│   ├── user-info.ts      # Dados de usuario
│   ├── course-info.ts    # Dados de cursos
│   └── nearby-units.ts   # Dados de unidades
└── mocks/
    └── swiper.tsx        # Mock de componentes externos
```

### 7.4. Convencao de Nomes

| Tipo | Padrao | Exemplo |
|------|--------|---------|
| Teste unitario | `[nome].test.ts` | `date.test.ts` |
| Teste de integracao | `[nome].integration.test.tsx` | `confirm-inscription-client.integration.test.tsx` |
| Fixtures | `fixtures/[contexto].ts` | `fixtures/user-info.ts` |
| Mocks de componentes | `mocks/[componente].tsx` | `mocks/swiper.tsx` |

---

## 8. Guia de Boas Praticas

### 8.1. Estrutura do Teste (AAA)

Todo teste deve seguir o padrao Arrange-Act-Assert:

```typescript
test('formats CPF correctly', () => {
  // Arrange - preparar dados e contexto
  const rawCpf = '12345678901'

  // Act - executar a acao sendo testada
  const result = formatCpf(rawCpf)

  // Assert - verificar o resultado
  expect(result).toBe('123.456.789-01')
})
```

Para testes mais complexos, separe as secoes com linhas em branco:

```typescript
test('submits form and shows success message', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<MyForm />)

  // Act
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.click(screen.getByRole('button', { name: /enviar/i }))

  // Assert
  await waitFor(() => {
    expect(screen.getByText(/sucesso/i)).toBeInTheDocument()
  })
})
```

### 8.2. Interacoes com userEvent

Sempre use `userEvent` em vez de `fireEvent` para simular interacoes do usuario. O `userEvent` simula o comportamento real do navegador.

```typescript
import userEvent from '@testing-library/user-event'

test('user interaction example', async () => {
  // Sempre inicialize o userEvent no inicio do teste
  const user = userEvent.setup()

  render(<MyComponent />)

  // Click
  await user.click(screen.getByRole('button'))

  // Digitacao
  await user.type(screen.getByRole('textbox'), 'texto digitado')

  // Limpar campo e digitar
  await user.clear(screen.getByRole('textbox'))
  await user.type(screen.getByRole('textbox'), 'novo texto')

  // Selecionar opcao
  await user.selectOptions(screen.getByRole('combobox'), 'opcao-1')

  // Hover
  await user.hover(screen.getByRole('button'))

  // Tab para proximo elemento
  await user.tab()
})
```

Importante: Todas as chamadas de `userEvent` sao assincronas e requerem `await`.

### 8.3. Queries do Testing Library

Use queries na seguinte ordem de prioridade:

1. **Queries acessiveis (preferidas)**
   - `getByRole` - busca por role ARIA (button, textbox, heading, etc.)
   - `getByLabelText` - busca por label associado
   - `getByPlaceholderText` - busca por placeholder
   - `getByText` - busca por conteudo de texto
   - `getByDisplayValue` - busca por valor exibido em inputs

2. **Queries semanticas**
   - `getByAltText` - busca por alt text de imagens
   - `getByTitle` - busca por atributo title

3. **Queries de escape (usar apenas quando necessario)**
   - `getByTestId` - busca por data-testid

```typescript
// Bom - usa role semantico
screen.getByRole('button', { name: /enviar/i })

// Bom - usa label acessivel
screen.getByLabelText(/email/i)

// Aceitavel - usa texto visivel
screen.getByText(/bem-vindo/i)

// Ultimo recurso - usa test id
screen.getByTestId('back-button')
```

Variantes das queries:

| Prefixo | Comportamento | Uso |
|---------|---------------|-----|
| `getBy` | Lanca erro se nao encontrar | Elemento deve existir |
| `queryBy` | Retorna null se nao encontrar | Verificar ausencia |
| `findBy` | Retorna Promise, espera elemento | Elementos assincronos |
| `getAllBy` | Retorna array, erro se vazio | Multiplos elementos |
| `queryAllBy` | Retorna array, pode ser vazio | Multiplos opcionais |
| `findAllBy` | Retorna Promise de array | Multiplos assincronos |

```typescript
// Verificar que elemento existe
expect(screen.getByRole('button')).toBeInTheDocument()

// Verificar que elemento NAO existe
expect(screen.queryByText(/erro/i)).not.toBeInTheDocument()

// Aguardar elemento aparecer
const message = await screen.findByText(/sucesso/i)
```

### 8.4. Testes Assincronos

Use `waitFor` para aguardar mudancas de estado:

```typescript
import { waitFor } from '@testing-library/react'

test('shows loading then content', async () => {
  render(<AsyncComponent />)

  // Aguardar condicao
  await waitFor(() => {
    expect(screen.getByText(/carregado/i)).toBeInTheDocument()
  })

  // Com timeout customizado
  await waitFor(
    () => {
      expect(screen.getByText(/resultado/i)).toBeInTheDocument()
    },
    { timeout: 5000 }
  )
})
```

Use `findBy` como alternativa mais concisa:

```typescript
// Equivalente a waitFor + getBy
const element = await screen.findByText(/sucesso/i)
expect(element).toBeInTheDocument()
```

### 8.5. Isolamento de Testes

Cada teste deve ser independente e nao depender de outros:

```typescript
describe('MyComponent', () => {
  // Limpar mocks antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Se usar fake timers
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })
})
```

### 8.6. Testes Unitarios vs Integracao

**Testes Unitarios** (`*.test.ts`)

- Testam funcoes puras isoladamente
- Nao renderizam componentes
- Rapidos e focados
- Sem dependencias externas

```typescript
// src/lib/__tests__/format-cpf.test.ts
describe('formatCpf', () => {
  test('formats valid CPF', () => {
    expect(formatCpf('12345678901')).toBe('123.456.789-01')
  })

  test('returns empty for invalid input', () => {
    expect(formatCpf('')).toBe('')
  })
})
```

**Testes de Integracao** (`*.integration.test.tsx`)

- Testam componentes com suas dependencias
- Renderizam e interagem com UI
- Verificam fluxos completos
- Podem usar MSW para simular APIs

```typescript
// src/app/.../__tests__/my-form.integration.test.tsx
describe('MyForm', () => {
  test('submits form successfully', async () => {
    const user = userEvent.setup()
    render(<MyForm />)

    await user.type(screen.getByLabelText(/nome/i), 'Joao')
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(screen.getByText(/sucesso/i)).toBeInTheDocument()
    })
  })
})
```

### 8.7. O que Testar

**Testar:**

- Comportamento visivel ao usuario
- Fluxos criticos (login, checkout, inscricao)
- Estados de erro e loading
- Validacoes de formulario
- Navegacao e redirecionamentos
- Funcoes utilitarias com logica de negocio

**Nao testar:**

- Detalhes de implementacao
- Estilos CSS
- Bibliotecas de terceiros
- Getters/setters triviais

```typescript
// Bom - testa comportamento
test('disables button when form is invalid', () => {
  render(<Form />)
  expect(screen.getByRole('button')).toBeDisabled()
})

// Ruim - testa implementacao
test('sets isValid state to false', () => {
  // Nao teste estado interno
})
```

### 8.8. Anti-patterns a Evitar

**1. Nao use seletores frageis**

```typescript
// Ruim
screen.getByRole('button', { name: '' })
document.querySelector('.btn-primary')

// Bom
screen.getByRole('button', { name: /enviar/i })
screen.getByTestId('submit-button')
```

**2. Nao faca assertions no render**

```typescript
// Ruim
render(<Component />)
expect(screen.getByText('texto')).toBeInTheDocument() // pode falhar antes de carregar

// Bom
render(<Component />)
await waitFor(() => {
  expect(screen.getByText('texto')).toBeInTheDocument()
})
```

**3. Nao deixe imports/mocks nao utilizados**

```typescript
// Ruim - imports nao usados poluem o arquivo
import { http, HttpResponse } from 'msw' // nao usado
const mockUnused = vi.fn() // nao usado

// Bom - apenas o necessario
import { render, screen } from '@testing-library/react'
```

**4. Nao teste multiplas coisas no mesmo teste**

```typescript
// Ruim - teste faz muita coisa
test('form works', async () => {
  // testa renderizacao
  // testa validacao
  // testa submit
  // testa erro
  // testa sucesso
})

// Bom - testes focados
test('renders form fields', () => { /* ... */ })
test('shows validation error for invalid email', () => { /* ... */ })
test('submits form successfully', () => { /* ... */ })
test('shows error message on API failure', () => { /* ... */ })
```

**5. Nao use delays arbitrarios**

```typescript
// Ruim
await new Promise(resolve => setTimeout(resolve, 1000))

// Bom
await waitFor(() => {
  expect(screen.getByText(/resultado/i)).toBeInTheDocument()
})
```

**6. Nao ignore erros nos testes**

```typescript
// Ruim
test('handles error', async () => {
  try {
    await doSomething()
  } catch {
    // ignora erro
  }
})

// Bom
test('throws error for invalid input', async () => {
  await expect(doSomething()).rejects.toThrow('mensagem esperada')
})
```

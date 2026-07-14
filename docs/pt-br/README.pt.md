# 🏛️ SuperApp - PrefRio 🇧🇷

## Sumário

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Orval - Geração de API](#orval---geração-de-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)

## Visão Geral

Este é um projeto **Next.js 15** construído com:

- **Framework**: Next.js 15.4.6 com React 19
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4.1.5
- **Autenticação**: Keycloak (Identidade Carioca)
- **Geração de Http Clients API**: Orval
- **UI Components**: Radix UI + shadcn/ui
- **Validação**: Zod + React Hook Form
- **Node Version**: 23.7.0

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js**: versão 23.7.0 (recomendado usar nvm)
- **npm**: versão compatível com Node 23.7.0
- **Git**: para versionamento

### Instalando o Node.js correto

```bash
# Se você usa nvm (recomendado)
nvm install 23.7.0
nvm use 23.7.0

# Verifique a versão instalada
node --version
```

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone git@github.com:prefeitura-rio/superapp.git
cd superapp
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis e seus respectivos valores:

```env
# Keycloak / Identidade Carioca
NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL=
NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID=superapp
NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI=
IDENTIDADE_CARIOCA_CLIENT_SECRET=

# URLs das APIs
NEXT_PUBLIC_BASE_API_URL=
BASE_API_URL_APP_BUSCA_SEARCH=
BASE_API_URL_SUBPAV_OSA_API=
BASE_API_URL_RMI=
COURSES_BASE_API_URL=

# Gov.br
NEXT_PUBLIC_GOVBR_BASE_URL=

# Analytics e Tracking
NEXT_PUBLIC_HOTJAR_ID=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=G

# Google Maps
GOOGLE_MAPS_API_KEY=

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# API Keys Internas
API_KEY_SUBPAV_OSA_SMS=

# Ambiente
NODE_ENV=development
```

## Como Rodar o Projeto

### Modo Desenvolvimento

Para iniciar o servidor de desenvolvimento com Turbopack:

```bash
npm run dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

### Modo Produção

Para fazer build e rodar em modo produção:

```bash
# Build da aplicação
npm run build

# Iniciar servidor de produção
npm start
```

### Lint

Para executar verificações de código:

```bash
npm run lint
```

## Sistema de Autenticação

A aplicação utiliza **Keycloak** (Identidade Carioca) para autenticação via OAuth 2.0 / OpenID Connect.

### Fluxo de Autenticação

#### 1. **Início do Login**

O usuário é redirecionado para o Keycloak (Identidade Carioca) quando tenta acessar rotas protegidas:

#### 2. **Callback após Login**

Após autenticação bem-sucedida, o Keycloak redireciona para:

```
/api/auth/callback/keycloak
```

**O que acontece:**

- Recebe o `code` do authorization code flow
- Troca o `code` por tokens (access_token e refresh_token) no endpoint `/token` do Keycloak
- Armazena os tokens em cookies httpOnly:
  - `access_token`: usado para autenticar requisições à API
  - `refresh_token`: usado para renovar o access_token quando expira

#### 3. **Middleware de Proteção de Rotas**

**Arquivo**: [`src/middleware.ts`](../../src/middleware.ts)

O middleware protege rotas e gerencia o estado de autenticação:

**Rotas Públicas:**

- `/` (home)
- `/busca/*`
- `/servicos/*`
- `/ouvidoria/*`
- `/sessao-expirada`
- `/politicas-de-uso-de-cookies`

**Rotas Protegidas:**

- `/carteira` (carteiras digitais)
- `/meu-perfil` (dados do usuário)
- Qualquer rota não listada como pública

**Funcionalidades do Middleware:**

1. **Verificação de Token**: Checa se o `access_token` existe nos cookies
2. **Validação de Expiração**: Usa `isJwtExpired()` para verificar se o token JWT expirou
3. **Refresh Automático**: Se o token expirou, tenta renová-lo usando o `refresh_token`
4. **Redirecionamento**: Redireciona usuários não autenticados para rotas de login

#### 4. **Renovação de Token**

Quando o `access_token` expira, o sistema:

- Usa o `refresh_token` para obter um novo `access_token`
- Faz uma requisição POST ao endpoint `/token` do Keycloak
- Atualiza os cookies com os novos tokens

#### 5. **Logout**

Processo de logout:

1. Recupera o `refresh_token` dos cookies
2. Faz uma requisição ao endpoint `/logout` do Keycloak
3. Limpa os cookies de autenticação (access_token e refresh_token)

### Uso dos Tokens nas Requisições API

O `customFetch` automaticamente adiciona o token de autenticação em todas as requisições:

### Segurança

- **Cookies httpOnly**: Tokens não são acessíveis via JavaScript (protege contra XSS)
- **CSP Headers**: Content Security Policy configurada no middleware
- **Token Expiration**: Validação automática de expiração de tokens
- **Refresh Token Flow**: Renovação de tokens sem interromper a experiência do usuário

## Orval - Geração de Http Clients API

O **Orval** é uma ferramenta que gera automaticamente código TypeScript para consumir APIs REST a partir de uma especificação OpenAPI.

### O que é o Orval?

Orval lê um arquivo OpenAPI (JSON/YAML) e gera:

- **Tipos TypeScript**: Interfaces e types baseados nos schemas da API
- **Funções de requisição**: Hooks e funções prontas para fazer chamadas HTTP
- **Validação**: Types seguros para requests e responses

### Configuração do Orval

**Arquivo**: [`orval.config.ts`](../../orval.config.ts)

```typescript
import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http/api.ts', // Arquivo principal gerado
      schemas: './src/http/models', // Pasta com tipos/models gerados
      mode: 'tags-split', // Separa endpoints por tags
      client: 'fetch', // Usa fetch API
      biome: true, // Formata com Biome
      httpClient: 'fetch',
      clean: true, // Limpa arquivos antigos antes de gerar
      override: {
        mutator: {
          path: './custom-fetch.ts', // Usa fetch customizado
          name: 'customFetch',
        },
      },
    },
  },
})
```

### Como o Orval funciona neste projeto

1. **Fonte de Dados (Input)**:

   - URL do OpenAPI spec: `https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/staging/docs/openapi-v3.json`
   - Orval faz download deste arquivo automaticamente

2. **Saída (Output)**:

   - **`src/http/api.ts`**: Arquivo principal com funções para fazer requisições
   - **`src/http/models/`**: Pasta com todos os tipos/interfaces TypeScript

3. **Mode: tags-split**:

   - Separa os endpoints em múltiplos arquivos baseado nas tags do OpenAPI
   - Organização: `src/http/admin/`, `src/http/citizen/`, `src/http/avatars/`, etc.

4. **Custom Fetch Mutator**:
   - Usa o [`custom-fetch.ts`](../../custom-fetch.ts) para todas as requisições
   - Adiciona automaticamente:
     - Token de autenticação (Bearer token)
     - Base URL correta
     - Headers necessários
     - Tratamento de diferentes content-types (JSON, PDF, etc.)

### Como Rodar o Orval

#### Gerar/Regenerar APIs

```bash
npx orval
```

Este comando irá:

1. Baixar o arquivo OpenAPI da URL configurada
2. Limpar a pasta `src/http/` (exceto arquivos personalizados)
3. Gerar novos arquivos TypeScript com:
   - Types e interfaces em `src/http/models/`
   - Funções de API organizadas por tags em subpastas

#### Quando rodar o Orval?

Execute `npx orval` quando:

- A API backend adicionar novos endpoints
- A API backend modificar schemas existentes
- Você clonar o repositório pela primeira vez
- Você precisar atualizar os tipos para refletir mudanças na API

### Estrutura Gerada pelo Orval

```
src/http/
├── admin/          # Endpoints
├── avatars/        #
├── beta-groups/    #
├── beta-whitelist/ #
├── citizen/        #
├── config/         #
├── health/         #
├── metrics/        #
├── phone/          #
├── validation/     #
└── models/         # Todos os tipos TypeScript (schemas)
```

É importante **não modificar** os arquivos gerados automáticamente.

### Exemplo de Uso

Depois que o Orval gera os arquivos, você pode importar e usar as funções:

```typescript
import { getCitizenProfile } from '@/http/citizen'

// A função já tem:
// - Types corretos de request/response
// - Autenticação automática (via custom-fetch)
// - Base URL configurada
const profile = await getCitizenProfile()
```

### Custom Fetch

O [`custom-fetch.ts`](../../custom-fetch.ts) intercepta todas as requisições geradas pelo Orval e:

### Benefícios do Orval

✅ **Type Safety**: Tipos TypeScript automáticos garantem segurança em tempo de compilação
✅ **Sincronização**: Código sempre sincronizado com a especificação da API
✅ **Produtividade**: Não é necessário escrever manualmente tipos e funções de API
✅ **Manutenibilidade**: Mudanças na API são refletidas facilmente rodando um comando
✅ **DX (Developer Experience)**: Autocomplete e validação no editor

## Estrutura do Projeto

```
superapp/
├── .github/              # Workflows e configurações do GitHub
├── .next/                # Build do Next.js (gerado)
├── docs/                 # Documentação adicional
├── k8s/                  # Configurações Kubernetes
├── node_modules/         # Dependências (gerado)
├── public/               # Assets estáticos
├── src/
│   ├── actions/          # Server actions do Next.js
│   ├── app/              # App Router do Next.js
│   │   ├── (app)/        # Grupo de rotas da aplicação
│   │   ├── (private)/    # Rotas privadas/autenticadas
│   │   ├── api/          # API routes
│   │   │   └── auth/     # Endpoints de autenticação
│   │   ├── components/   # Componentes específicos de páginas
│   │   ├── globals.css   # Estilos globais
│   │   └── layout.tsx    # Layout raiz
│   ├── assets/           # Imagens e assets
│   ├── components/       # Componentes React reutilizáveis
│   ├── constants/        # Constantes da aplicação
│   ├── env/              # Validação de variáveis de ambiente
│   ├── helpers/          # Funções auxiliares
│   ├── hooks/            # Custom React hooks
│   ├── http/             # APIs geradas pelo Orval
│   ├── http-courses/     # APIs geradas pelo Orval
│   ├── lib/              # Bibliotecas e utilitários
│   │   ├── jwt-utils.ts      # Utilitários JWT
│   │   ├── token-refresh.ts  # Lógica de refresh token
│   │   └── middleware-helpers.ts
│   ├── middleware.ts     # Middleware do Next.js
│   ├── mocks/            # Mocks para testes
│   ├── providers/        # Context providers
│   └── types/            # Tipos TypeScript compartilhados
├── .env                  # Variáveis de ambiente
├── .nvmrc                # Versão do Node.js
├── biome.json            # Configuração do Biome (linter/formatter)
├── components.json       # Configuração do shadcn/ui
├── custom-fetch.ts       # Fetch customizado para Orval
├── custom-fetch-course.ts
├── Dockerfile            # Docker para produção
├── next.config.ts        # Configuração do Next.js
├── orval.config.ts       # Configuração do Orval
├── package.json          # Dependências e scripts
├── postcss.config.mjs    # Configuração PostCSS
├── README.md             # README padrão
├── tsconfig.json         # Configuração TypeScript
└── doc.md                # Esta documentação
```

## Scripts Disponíveis

| Script    | Comando         | Descrição                                        |
| --------- | --------------- | ------------------------------------------------ |
| **dev**   | `npm run dev`   | Inicia servidor de desenvolvimento com Turbopack |
| **build** | `npm run build` | Cria build de produção                           |
| **start** | `npm start`     | Inicia servidor de produção                      |
| **lint**  | `npm run lint`  | Executa linter                                   |
| **orval** | `npx orval`     | Gera código TypeScript da API                    |

## Docker

O projeto inclui um `Dockerfile` para deployment. Para construir a imagem:

```bash
# Build da imagem
docker build -t superapp .

# Rodar container
docker run -p 3000:3000 superapp
```

## Tecnologias Principais

### Frontend

- **Next.js 15**: Framework React com App Router
- **React 19**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utility-first
- **Radix UI**: Componentes acessíveis e sem estilo
- **shadcn/ui**: Biblioteca de componentes

### Autenticação e Segurança

- **Keycloak**: Servidor de autenticação OAuth 2.0 / OIDC
- **jwt-decode**: Decodificação de JWT no frontend
- **CSP**: Content Security Policy configurada

### Formulários e Validação

- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **libphonenumber-js**: Validação de telefones

### APIs e HTTP

- **Orval**: Geração de código a partir de OpenAPI
- **Fetch API**: Cliente HTTP nativo

### Analytics e Monitoramento

- **Google Analytics**: Tracking de usuários
- **Google Tag Manager**: Gerenciamento de tags
- **Hotjar**: Análise de comportamento

### Outras

- **date-fns**: Manipulação de datas
- **Swiper**: Carrosséis e sliders
- **canvas-confetti**: Animações de confete
- **react-hot-toast / sonner**: Notificações toast

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feat/ck-999999/my-feature`
2. Commit suas mudanças: `git commit -m 'feat(courses-page): add my-courses list'`
3. Push para a branch: `git push origin feat/ck-999999/my-feature`
4. Abra um Pull Request

---

> 📅 Última atualização: Outubro 2025

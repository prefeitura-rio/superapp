# Documentacao MEI

## Sumario

1. [Visao Geral](#visao-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Fluxos de Negocio](#fluxos-de-negocio)
   - [Listagem de Oportunidades](#listagem-de-oportunidades)
   - [Detalhes da Oportunidade](#detalhes-da-oportunidade)
   - [Envio de Proposta](#envio-de-proposta)
   - [Minhas Propostas](#minhas-propostas)
   - [Cancelamento de Proposta](#cancelamento-de-proposta)
4. [Status de Propostas](#status-de-propostas)
5. [Validacoes](#validacoes)
   - [CNAE](#cnae)
   - [Situacao Cadastral](#situacao-cadastral)
6. [Estrutura de Dados](#estrutura-de-dados)
   - [Oportunidade](#oportunidade)
   - [Proposta](#proposta)
   - [Empresa MEI](#empresa-mei)
7. [Endpoints da API](#endpoints-da-api)
8. [Casos de Uso](#casos-de-uso)

---

## Visao Geral

O modulo MEI permite que Microempreendedores Individuais visualizem oportunidades de servicos oferecidas por orgaos publicos e enviem propostas comerciais.

**Principais funcionalidades:**
- Listagem de oportunidades disponiveis
- Visualizacao de detalhes de cada oportunidade
- Envio de propostas (multi-step)
- Acompanhamento de propostas enviadas
- Cancelamento de propostas pendentes
- Visualizacao dos dados da empresa MEI do usuario

---

## Estrutura de Arquivos

### Paginas

```
src/app/(app)/(logged-in-out)/servicos/(servicos)/mei/
├── page.tsx                    # Home - lista de oportunidades
├── [slug]/
│   ├── page.tsx               # Detalhes da oportunidade
│   └── proposta/
│       ├── page.tsx           # Formulario de proposta
│       ├── mei-proposal-client.tsx
│       ├── sucesso/page.tsx   # Pagina de sucesso
│       └── steps/
│           ├── value-step.tsx      # Etapa 1: Valor
│           ├── duration-step.tsx   # Etapa 2: Prazo
│           └── review-step.tsx     # Etapa 3: Revisao
├── menu/page.tsx              # Menu de navegacao
├── meu-mei/                   # Dados da empresa MEI
├── minhas-propostas/          # Lista de propostas do usuario
└── faq/page.tsx               # Perguntas frequentes
```

### Componentes

```
src/app/components/mei/
├── mei-page-client.tsx              # Componente principal da home
├── mei-opportunity-card.tsx         # Card de oportunidade
├── mei-opportunity-detail.tsx       # Detalhes da oportunidade
├── mei-opportunity-header.tsx       # Header com imagem
├── mei-proposal-card.tsx            # Card de proposta do usuario
├── proposal-status-badge.tsx        # Badge de status da proposta
├── cancel-proposal-drawer.tsx       # Modal de cancelamento
├── service-type-drawer/             # Drawers de validacao
│   ├── service-type-drawer.tsx
│   ├── cnae-info-sheet.tsx
│   ├── cnae-incompatible-sheet.tsx
│   ├── no-mei-sheet.tsx
│   └── irregular-status-sheet.tsx
└── actions/
    ├── fetch-cnaes.ts               # Busca CNAEs por ID
    └── delete-proposal.ts           # Deleta proposta
```

### Utilitarios e Constantes

- `src/lib/mei-utils.ts` - Funcoes de formatacao, mapeamento e validacao (client-safe)
- `src/lib/mei-utils.server.ts` - Funcoes server-only (ex: getUserLegalEntity)
- `src/constants/mei-links.ts` - Links externos (portal MEI, regularizacao)

> **Nota:** Funcoes que fazem fetch de APIs server-side (usando cookies) devem ficar em `mei-utils.server.ts` para evitar erros de bundle em Client Components.

### API (Orval)

```
src/http-courses/
├── oportunidades-mei/oportunidades-mei.ts
├── propostas-mei/propostas-mei.ts
└── models/
    ├── modelsOportunidadeMEI.ts
    ├── modelsPropostaMEI.ts
    ├── modelsOportunidadeMEIStatus.ts
    ├── modelsPropostaMEIStatusCidadao.ts
    └── modelsPropostaMEIStatusAdmin.ts
```

---

## Fluxos de Negocio

### Listagem de Oportunidades

**Rota:** `/servicos/mei`

**Fluxo:**
1. Busca oportunidades ativas via `getApiV1OportunidadesMei({ status: 'active' })`
2. Se usuario logado, busca propostas via `getPropostasMeiPorEmpresa(cnpj)`
3. Filtra oportunidades que ja tem proposta do usuario (evita duplicacao)
4. Renderiza duas secoes:
   - "Minhas oportunidades" - propostas ja enviadas
   - "Todas as oportunidades" - oportunidades disponiveis

**Arquivos principais:**
- `mei/page.tsx` - Server component que busca dados
- `mei-page-client.tsx` - Client component que renderiza

---

### Detalhes da Oportunidade

**Rota:** `/servicos/mei/[slug]`

**Fluxo:**
1. Busca oportunidade por ID via `getApiV1OportunidadesMeiId(slug)`
2. Busca nome do orgao via `getDepartmentsCdUa(orgao_id)`
3. Se usuario logado, monta contexto MEI:
   - Verifica se tem empresa MEI
   - Valida situacao cadastral
   - Compara CNAEs do usuario vs oportunidade
   - Verifica se ja tem proposta existente
4. Renderiza detalhes com botao de acao apropriado

**Botao de Acao (logica de decisao):**
- Nao logado: "Fazer login para enviar proposta"
- Sem MEI: "Abrir MEI para enviar proposta"
- Situacao irregular: "Regularizar situacao para enviar proposta"
- CNAE incompativel: Abre drawer explicativo
- Tudo OK: "Enviar proposta"
- Ja tem proposta: Mostra badge de status (sem botao)

**Arquivos principais:**
- `mei/[slug]/page.tsx` - Server component
- `mei-opportunity-detail.tsx` - Client component

---

### Envio de Proposta

**Rota:** `/servicos/mei/[slug]/proposta`

**Fluxo Multi-step:**

| Etapa | URL | Descricao |
|-------|-----|-----------|
| 1 | `?step=value` | Usuario informa valor da proposta |
| 2 | `?step=duration` | Usuario informa prazo em dias |
| 3 | `?step=review` | Revisao e aceite dos termos |

**Submissao:**
```typescript
// Dados enviados para API
{
  mei_empresa_id: string  // CNPJ sem formatacao
  valor_proposta: number
}
```

**Endpoint:** `POST /api/v1/oportunidades-mei/{id}/propostas`

**Arquivos principais:**
- `mei/[slug]/proposta/mei-proposal-client.tsx`
- `mei/[slug]/proposta/steps/*.tsx`

---

### Minhas Propostas

**Rota:** `/servicos/mei/minhas-propostas`

**Fluxo:**
1. Busca CNPJ do usuario via `getCitizenCpfLegalEntities(cpf)`
2. Busca propostas via `getPropostasMeiPorEmpresa(cnpj)`
3. Para cada proposta, busca dados da oportunidade
4. Renderiza lista com status e opcao de cancelar (se pendente)

**Estados:**
- Sem MEI: Empty state com link para criar MEI
- Com MEI sem propostas: Empty state
- Com MEI com propostas: Lista de cards

**Arquivos principais:**
- `mei/minhas-propostas/page.tsx`
- `mei/minhas-propostas/minhas-propostas-client.tsx`

---

### Cancelamento de Proposta

**Condicao:** Somente propostas com status `submitted` (pendente) podem ser canceladas.

**Fluxo:**
1. Usuario clica no icone de lixeira (header da oportunidade)
2. Abre drawer de confirmacao
3. Usuario confirma cancelamento
4. Chama `DELETE /api/v1/oportunidades-mei/{id}/propostas/{propostaId}`
5. Exibe toast de sucesso
6. Atualiza pagina (router.refresh)

**Arquivos principais:**
- `cancel-proposal-drawer.tsx`
- `actions/delete-proposal.ts`

---

## Status de Propostas

### Mapeamento API -> Frontend

| API (status_cidadao) | Frontend | Descricao |
|---------------------|----------|-----------|
| `submitted` | `em_analise` | Proposta enviada, aguardando avaliacao |
| `approved` | `aprovada` | Proposta aprovada pelo orgao |
| `rejected` | `recusada` | Proposta recusada pelo orgao |
| - | `concluida` | Servico concluido (futuro) |

### Visualizacao (ProposalStatusBadge)

| Status | Icone | Cor | Mensagem |
|--------|-------|-----|----------|
| submitted | Relogio | Cinza | "Sua proposta foi enviada e esta sendo avaliada..." |
| approved | Check | Verde | "Sua proposta foi aprovada. Voce tem ate o dia X para conclui-la." |
| rejected | X | Vermelho | "Sua proposta foi recusada." |

### Regras de Exibicao

- Lixeira (cancelar): Somente para status `submitted`
- Badge de status: Sempre que houver proposta
- Botao "Enviar proposta": Somente quando NAO houver proposta

---

## Validacoes

### CNAE

O CNAE (Classificacao Nacional de Atividade Economica) determina quais atividades o MEI pode exercer.

**Validacao de Compatibilidade:**
```typescript
// src/lib/mei-utils.ts
hasCompatibleCnae(userCnaes: string[], opportunityCnaes: string[]): boolean
```

- Compara CNAEs do usuario (principal + secundarios) com CNAEs da oportunidade
- Normaliza para comparacao: remove formatacao (ex: "4520-0/02" -> "4520002")
- Retorna `true` se houver pelo menos um CNAE compativel

**Quando CNAE e incompativel:**
- Abre drawer mostrando CNAEs necessarios
- Usuario nao consegue enviar proposta

### Situacao Cadastral

| Status | Pode Enviar Proposta? | Acao |
|--------|----------------------|------|
| Ativa | Sim | - |
| Suspensa | Nao | Redireciona para regularizacao |
| Inapta | Nao | Redireciona para regularizacao |
| Baixada | Nao | Redireciona para regularizacao |
| Nula | Nao | Redireciona para regularizacao |

**Link de Regularizacao:** `https://www8.receita.fazenda.gov.br/simplesnacional/`

---

## Estrutura de Dados

### Oportunidade

**API (ModelsOportunidadeMEI):**
```typescript
{
  id?: number
  titulo?: string
  descricao_servico?: string
  status?: 'draft' | 'active' | 'expired'
  data_expiracao?: string        // ISO
  data_limite_execucao?: string  // ISO
  cover_image?: string
  gallery_images?: string[]
  orgao_id?: string
  cnae_ids?: string[]
  forma_pagamento?: 'CHEQUE' | 'DINHEIRO' | 'CARTAO' | 'PIX' | 'TRANSFERENCIA'
  prazo_pagamento?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}
```

**Frontend (MeiOpportunityDetailData):**
```typescript
{
  id: number
  slug: string
  title: string
  expiresAt: string
  coverImage?: string
  serviceType: string
  description: string
  organization: { name: string; logo?: string }
  location: { name: string; address: string }
  payment: { method: string; deadline: string }
  executionDeadline: string  // Formatado DD/MM/YYYY
  attachments: MeiAttachment[]
  cnaeIds?: string[]
}
```

---

### Proposta

**API (ModelsPropostaMEI):**
```typescript
{
  id?: string
  status_cidadao?: 'submitted' | 'approved' | 'rejected'
  status_admin?: 'draft' | 'active' | 'expired'
  oportunidade_mei_id?: number
  mei_empresa_id?: string
  valor_proposta?: number
}
```

**Frontend (MeiProposal):**
```typescript
{
  id: string                // UUID da proposta
  opportunityId: number
  opportunitySlug: string
  title: string
  coverImage?: string
  status: 'aprovada' | 'em_analise' | 'recusada' | 'concluida'
}
```

---

### Empresa MEI

**API (ModelsLegalEntity - via Cidadao):**
```typescript
{
  cnpj?: string
  razao_social?: string
  nome_fantasia?: string
  situacao_cadastral?: { descricao: string }
  cnae_fiscal?: string
  cnae_secundarias?: string[]
  contato?: {
    telefone?: Array<{ ddd: string; telefone: string }>
    email?: string
  }
  natureza_juridica?: { descricao: string }
}
```

**Frontend (MeiCompanyFullData):**
```typescript
{
  cnpj: string              // Formatado
  razaoSocial: string
  nomeFantasia: string
  situacaoCadastral: 'Ativa' | 'Suspensa' | 'Inapta' | 'Baixada' | 'Nula'
  telefone: { ddi: '55'; ddd: string; valor: string }
  email: string
  naturezaJuridica: string
  cnaePrincipal: { codigo: string; descricao: string }
  cnaesSecundarios: Array<{ codigo: string; descricao: string }>
}
```

---

## Endpoints da API

### Oportunidades

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/oportunidades-mei` | Listar oportunidades (paginado) |
| GET | `/api/v1/oportunidades-mei/{id}` | Obter oportunidade por ID |

**Parametros de listagem:**
- `page`: Pagina (default: 1)
- `pageSize`: Itens por pagina (default: 10)
- `status`: Filtro de status ('active', 'draft', 'expired')

---

### Propostas

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/propostas-mei/por-empresa` | Listar propostas por CNPJ |
| POST | `/api/v1/oportunidades-mei/{id}/propostas` | Criar proposta |
| DELETE | `/api/v1/oportunidades-mei/{id}/propostas/{propostaId}` | Deletar proposta |

**Parametros de listagem por empresa:**
- `meiEmpresaId`: CNPJ sem formatacao
- `page`: Pagina
- `pageSize`: Itens por pagina

---

## Casos de Uso

### Caso 1: Usuario nao logado
1. Acessa oportunidade
2. Visualiza todas as informacoes
3. Clica em "Enviar proposta"
4. Redirecionado para login
5. Apos login, volta para oportunidade

### Caso 2: Usuario logado sem MEI
1. Acessa oportunidade
2. Clica em "Enviar proposta"
3. Abre drawer "Voce nao possui uma empresa MEI"
4. Link "Quero ser MEI" abre portal do governo

### Caso 3: Usuario com MEI inativo
1. Acessa oportunidade
2. Clica em "Enviar proposta"
3. Abre drawer "Sua empresa nao possui situacao cadastral ativa"
4. Link "Regularizar situacao" abre Simples Nacional

### Caso 4: Usuario com CNAE incompativel
1. Acessa oportunidade com CNAEs especificos
2. Clica em "Enviar proposta"
3. Abre drawer mostrando CNAEs necessarios
4. Nao consegue enviar proposta

### Caso 5: Usuario compativel
1. Acessa oportunidade
2. Clica em "Enviar proposta"
3. Preenche valor e prazo
4. Revisa e aceita termos
5. Proposta enviada com sucesso

### Caso 6: Usuario com proposta existente
1. Acessa oportunidade ja proposta
2. Ve badge de status (pendente/aprovada/recusada)
3. Se pendente, pode cancelar clicando na lixeira
4. Apos cancelamento, pode enviar nova proposta

---

## Arquitetura de Codigo

### Separacao Server/Client

Para evitar erros de bundle, o codigo esta separado em:

| Arquivo | Tipo | Conteudo |
|---------|------|----------|
| `mei-utils.ts` | Client-safe | Mappers, formatters, validadores puros |
| `mei-utils.server.ts` | Server-only | `getUserLegalEntity` (usa cookies) |

**Regra:** Nunca importe `mei-utils.server.ts` em arquivos com `'use client'`.

### Componentes Reutilizaveis

| Componente | Uso | Variantes |
|------------|-----|-----------|
| `MeiEmptyState` | Estado sem MEI | `'meu-mei'` (texto completo), `'propostas'` (texto curto) |
| `ProposalStatusBadge` | Status da proposta | `submitted`, `approved`, `rejected` |

### Helper getUserLegalEntity

Centraliza a busca de empresa MEI do usuario:

```typescript
// src/lib/mei-utils.server.ts
import 'server-only'

export async function getUserLegalEntity(cpf: string): Promise<{
  entity: ModelsLegalEntity
  cnpj: string
} | null>
```

**Usado em:**
- `mei/page.tsx` - Home de oportunidades
- `mei/[slug]/page.tsx` - Detalhe da oportunidade
- `mei/[slug]/proposta/page.tsx` - Formulario de proposta
- `mei/meu-mei/get-mei-company-data.ts` - Dados da empresa
- `mei/minhas-propostas/page.tsx` - Lista de propostas

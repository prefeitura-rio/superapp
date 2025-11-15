# Integração com API de Busca e Categorias

## Visão Geral

Este documento descreve a integração do Portal do Cidadão com a API de Busca (`app-busca-search`), que fornece endpoints para busca unificada de serviços públicos e gerenciamento de categorias.

## Endpoints Utilizados

### 1. Busca Unificada de Serviços
**Endpoint**: `GET /api/v1/search`

Executa busca de serviços com múltiplas estratégias: keyword (textual), semantic (vetorial), hybrid (combinada) ou ai (agente inteligente).

### 2. Busca por ID
**Endpoint**: `GET /api/v1/search/{id}`

Retorna detalhes completos de um serviço específico através de busca direta por UUID.

### 3. Categorias com Filtros
**Endpoint**: `GET /api/v1/categories`

Lista categorias com opções de ordenação e filtragem de serviços por categoria.

## Configuração

### Variável de Ambiente
```env
NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH=https://seu-dominio.com/
```

### Cliente HTTP Customizado
Localização: `custom-fetch-busca-search.ts`

Função wrapper que adiciona a base URL configurada a todas as requisições geradas pelo Orval.

## Implementação

### 1. Busca Unificada

**Arquivo**: `src/app/api/search/route.ts`

**Parâmetros**:
- `q`: Texto da busca (obrigatório)
- `type`: `semantic` (busca vetorial)
- `threshold_semantic`: `0.4` (score mínimo de 40%)
- `include_inactive`: `true` (inclui serviços inativos/rascunhos)
- `page`: `1`
- `per_page`: `20`

**Cache**: 10 minutos (600 segundos)

**Exemplo de uso**:
```typescript
const response = await getApiV1Search({
  q: 'matrícula escolar',
  type: ModelsSearchType.SearchTypeSemantic,
  page: 1,
  per_page: 20,
  include_inactive: true,
  threshold_semantic: 0.4,
}, {
  next: {
    revalidate: 600,
    tags: ['search-api'],
  },
})
```

**Resposta transformada**:
```typescript
{
  result: [
    {
      id: 'uuid',
      titulo: 'Nome do serviço',
      descricao: 'Descrição do serviço',
      category: 'Educação',
      tipo: 'servico'
    }
  ]
}
```

### 2. Listagem de Categorias

**Arquivo**: `src/lib/categories.ts`

**Função**: `fetchCategories()`

**Parâmetros**:
- `sort_by`: `popularity` (ordenação por popularidade)
- `order`: `desc` (ordem decrescente)
- `include_inactive`: `true` (inclui serviços inativos)

**Cache**: 10 minutos (600 segundos)

**Exemplo de uso**:
```typescript
const response = await getApiV1Categories({
  sort_by: GetApiV1CategoriesSortBy.popularity,
  order: GetApiV1CategoriesOrder.desc,
  include_inactive: true,
}, {
  next: {
    revalidate: 600,
    tags: ['categories'],
  },
})
```

**Transformação de dados**:
```typescript
const categories = response.data.categories
  .map((apiCategory): Category => ({
    name: apiCategory.name || '',
    icon: getIconForCategory(apiCategory.name || ''),
    categorySlug: normalizeCategoryName(apiCategory.name || ''),
    relevanciaMedia: apiCategory.popularity_score || 0,
    quantidadeServicos: apiCategory.count || 0,
  }))
  .filter(cat => cat.quantidadeServicos > 0)
  .sort((a, b) => b.relevanciaMedia - a.relevanciaMedia)
```

### 3. Serviços por Categoria

**Arquivo**: `src/lib/services-utils.ts`

**Função**: `fetchServicesByCategory(categorySlug: string)`

**Parâmetros**:
- `filter_category`: Nome da categoria (ex: "Educação")
- `page`: `1`
- `per_page`: `20`
- `include_inactive`: `true`

**Cache**: 10 minutos (600 segundos) com tag específica por categoria

**Exemplo de uso**:
```typescript
const response = await getApiV1Categories({
  filter_category: 'Educação',
  page: 1,
  per_page: 20,
  include_inactive: true,
}, {
  next: {
    revalidate: 600,
    tags: ['category-services', categorySlug],
  },
})
```

### 4. Detalhes de Serviço por ID

**Arquivo**: `src/lib/services-utils.ts`

**Função**: `fetchServiceById(id: string)`

**Cache**: 10 minutos (600 segundos) com tag específica por serviço

**Exemplo de uso**:
```typescript
const response = await getApiV1SearchId(id, {
  next: {
    revalidate: 600,
    tags: ['service', id],
  },
})
```

**Retorno**: `ModelsPrefRioService` (tipo gerado pelo Orval)

## Tipos de Dados

### ModelsPrefRioService
Tipo principal para serviços do Portal Interno:

```typescript
interface ModelsPrefRioService {
  id?: string
  nome_servico: string
  resumo: string
  descricao_completa: string
  autor: string
  custo_servico: string
  tempo_atendimento: string
  resultado_solicitacao: string
  tema_geral: string
  orgao_gestor: string[]
  canais_digitais?: string[]
  canais_presenciais?: string[]
  documentos_necessarios?: string[]
  legislacao_relacionada?: string[]
  publico_especifico?: string[]
  buttons?: ModelsButton[]
  status?: number // 0=Draft, 1=Published
  awaiting_approval?: boolean
  fixar_destaque?: boolean
  is_free?: boolean
  created_at?: number
  last_update?: number
  published_at?: number
}
```

### ModelsButton
```typescript
interface ModelsButton {
  titulo?: string
  descricao?: string
  url_service?: string
  is_enabled?: boolean
  ordem?: number
}
```

## Estratégia de Cache

Todas as chamadas à API possuem cache configurado:

| Endpoint | Duração | Tags |
|----------|---------|------|
| Busca unificada | 10 min | `['search-api']` |
| Categorias | 10 min | `['categories']` |
| Serviços por categoria | 10 min | `['category-services', categorySlug]` |
| Serviço por ID | 10 min | `['service', id]` |

**Revalidação manual**:
```typescript
import { revalidateTag } from 'next/cache'

// Revalidar todas as buscas
revalidateTag('search-api')

// Revalidar categorias
revalidateTag('categories')

// Revalidar serviços de uma categoria específica
revalidateTag('category-services')

// Revalidar um serviço específico
revalidateTag('service')
```

## Tipos de Busca Disponíveis

```typescript
export const ModelsSearchType = {
  SearchTypeKeyword: 'keyword',    // Busca textual tradicional
  SearchTypeSemantic: 'semantic',  // Busca vetorial com embeddings (ATUAL)
  SearchTypeHybrid: 'hybrid',      // Combinação de keyword + semantic
  SearchTypeAI: 'ai',              // Agente inteligente
} as const
```

**Configuração atual**: `semantic` com threshold de 0.4

## Parâmetros de Threshold

```typescript
interface SearchParams {
  threshold_keyword?: number      // Score mínimo para busca keyword (0-1)
  threshold_semantic?: number     // Score mínimo para busca semantic (0-1) - ATUAL: 0.4
  threshold_hybrid?: number       // Score mínimo para busca hybrid (0-1)
  alpha?: number                  // Alpha para busca hybrid (0-1, default: 0.3)
  exclude_agent_exclusive?: boolean // Exclui serviços exclusivos para IA
}
```

## Normalização de Categorias

Categorias são normalizadas para criar slugs URL-friendly:

```typescript
function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')  // Remove acentos
    .trim()
}
```

**Exemplos**:
- `Educação` → `educacao`
- `Saúde` → `saude`
- `Segurança Pública` → `seguranca publica`

## Navegação entre Páginas

### Busca → Detalhes do Serviço
```typescript
// De: /busca
// Para: /servicos/categoria/{categorySlug}/{serviceId}

const categorySlug = item.category
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()

router.push(`/servicos/categoria/${encodeURIComponent(categorySlug)}/${item.id}`)
```

### Categoria → Detalhes do Serviço
```typescript
// De: /servicos/categoria/{categorySlug}
// Para: /servicos/categoria/{categorySlug}/{serviceId}

href={`/servicos/categoria/${categorySlug}/${service.id}`}
```

## Geração de Tipos com Orval

**Configuração**: `orval.config.ts`

```typescript
export default defineConfig({
  'app-busca-search': {
    input: './openapi/app-busca-search.yaml',
    output: {
      mode: 'tags-split',
      target: 'src/http-busca-search',
      schemas: 'src/http-busca-search/models',
      client: 'fetch',
      mock: false,
      prettier: false,
      biome: true,
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: './custom-fetch-busca-search.ts',
          name: 'customFetchBuscaSearch',
        },
      },
    },
  },
})
```

**Comando para gerar tipos**:
```bash
npm run orval
```

## Melhorias Implementadas

### ❌ Antes
- Mapeamento complexo entre tipos (`ServiceFromPortalInterno` ↔ `ModelsServiceDocument`)
- Funções auxiliares redundantes (`getValue`, `getArray`)
- Casting excessivo e conversões de tipos
- Sem cache configurado
- URLs com parâmetro `collection` desnecessário

### ✅ Depois
- Uso direto de tipos gerados pelo Orval (`ModelsPrefRioService`)
- Retorno direto da API sem transformações
- Type-safe com TypeScript
- Cache de 10 minutos em todas as chamadas
- URLs simplificadas: `/servicos/categoria/{slug}/{id}`
- Busca semântica com threshold configurável

## Arquivos Modificados

1. `custom-fetch-busca-search.ts` - Cliente HTTP customizado
2. `src/app/api/search/route.ts` - Endpoint de busca unificada
3. `src/lib/categories.ts` - Funções de categorias
4. `src/lib/services-utils.ts` - Funções de serviços
5. `src/app/(app)/(logged-in-out)/busca/page.tsx` - Página de busca
6. `src/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/page.tsx` - Lista de serviços
7. `src/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/page.tsx` - Detalhes do serviço
8. `src/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/components/portal-interno-service.tsx` - Componente de serviço

## Troubleshooting

### Erro: "Environment variable is not set"
Verifique se `NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH` está configurada no `.env.local`.

### Erro: Tipos não encontrados
Execute `npm run orval` para gerar os tipos a partir do OpenAPI spec.

### Cache não está funcionando
Verifique se o projeto está em modo de produção. Em desenvolvimento, o Next.js pode ignorar algumas configurações de cache.

### Serviços não aparecem
Verifique se `include_inactive: true` está configurado para incluir serviços em rascunho.

# Documentação da Feature de Busca

## Visão Geral

A feature de busca permite que os usuários pesquisem por serviços, cursos, empregos e links externos na aplicação. A implementação combina resultados da API com uma lista hardcoded de links externos, priorizando os resultados hardcoded para garantir que conteúdos importantes sempre apareçam.

### Feature Flag

A funcionalidade de links hardcoded pode ser habilitada/desabilitada através de uma feature flag:

**Variável de Ambiente:**
```bash
NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS=true
```

**Comportamento:**
- **Default (desabilitado)**: Apenas resultados da API são retornados
- **Habilitado**: Resultados hardcoded são incluídos e mesclados com resultados da API

**Localização:** `src/constants/venvs.ts`

## Arquitetura

### Estrutura de Arquivos

```
src/
├── app/(app)/(logged-in-out)/busca/
│   ├── page.tsx                          # Componente principal da página
│   ├── hooks/
│   │   └── use-search.ts                 # Hook customizado para gerenciar estado e lógica
│   └── utils/
│       └── navigation-helpers.ts         # Funções auxiliares de navegação
├── helpers/
│   └── search-helpers.ts                 # Funções utilitárias de busca
├── constants/
│   └── external-search-links.ts          # Lista hardcoded de links externos
└── app/components/drawer-contents/
    └── external-link-drawer.tsx          # Componente de confirmação para links externos
```

## Componentes Principais

### 1. Página de Busca (`page.tsx`)

Componente React que renderiza a interface de busca, incluindo:
- Input de busca
- Lista de resultados
- Histórico de buscas
- Sugestões de buscas populares
- Bottom sheet para confirmação de links externos

### 2. Hook `useSearch` (`hooks/use-search.ts`)

Hook customizado que gerencia todo o estado e lógica da busca:

**Funcionalidades:**
- Gerenciamento de estado (query, results, loading, etc.)
- Sincronização com URL (query params)
- Debounce de 500ms para otimizar requisições
- Carregamento automático de busca a partir da URL
- Histórico de buscas no localStorage
- Auto-focus no input ao montar

**Estados gerenciados:**
- `query`: Termo de busca atual
- `results`: Resultados da busca
- `loading`: Estado de carregamento
- `isSearching`: Estado de busca em andamento
- `searchHistory`: Histórico de buscas

### 3. Helpers de Busca (`helpers/search-helpers.ts`)

Funções utilitárias para processamento de busca:

#### `normalizeSearchText(text: string)`
Normaliza texto removendo acentos e caracteres especiais:
- Converte para minúsculas
- Remove diacríticos (acentos, cedilhas, tildes)
- Remove espaços extras

**Exemplo:**
```typescript
normalizeSearchText("Jaé") // retorna "jae"
normalizeSearchText("transporte") // retorna "transporte"
```

#### `filterHardcodedResults(query, hardcodedItems)`
Filtra resultados hardcoded baseado na query:

**Características:**
- Busca exata (comportamento original)
- Busca por palavras individuais (nova funcionalidade)
- Remove stop words (como, faço, para, o, etc.)
- Sistema de pontuação de relevância:
  - Título: 10 pontos por palavra
  - Palavras-chave: 8 pontos por palavra
  - Descrição: 5 pontos por palavra
- Ordena resultados por relevância

**Exemplo:**
```typescript
// Query: "como faço para carregar o cartão jaé"
// Remove stop words: ["carregar", "cartao", "jae"]
// Encontra "jae" no título → +10 pontos
// Encontra "carregar" e "cartao" em palavras-chave → +8 pontos cada
// Resultado: Retorna item com alta relevância
```

#### `mergeSearchResults(hardcodedResults, apiResults)`
Mescla resultados hardcoded com resultados da API:
- Prioriza resultados hardcoded (aparecem primeiro)
- Remove duplicatas por URL
- Converte formato hardcoded para formato padrão

#### `performSearch(searchQuery)`
Executa busca completa:
1. Verifica feature flag `ENABLE_HARDCODED_SEARCH_LINKS`
2. Se habilitado: Filtra resultados hardcoded
3. Busca na API
4. Se habilitado: Mescla resultados (hardcoded primeiro)
5. Retorna lista unificada ou apenas resultados da API

**Feature Flag:**
- Se `ENABLE_HARDCODED_SEARCH_LINKS === false` (default): Retorna apenas resultados da API
- Se `ENABLE_HARDCODED_SEARCH_LINKS === true`: Inclui e prioriza resultados hardcoded

#### Funções de Histórico
- `loadSearchHistory()`: Carrega histórico do localStorage
- `saveSearchToHistory(query)`: Salva busca no histórico
- `removeFromHistory(item)`: Remove item do histórico

### 4. Helpers de Navegação (`utils/navigation-helpers.ts`)

Funções para gerenciar navegação:

#### `handleBackNavigation(router)`
Gerencia navegação de volta:
- Verifica sessionStorage para rota anterior
- Verifica document.referrer
- Valida se rota é do mesmo domínio
- Evita navegação para rotas filhas
- Fallback para "/" se não houver rota válida

#### `handleSearchItemClick(item, query, router, onExternalLinkClick)`
Gerencia clique em resultado:
- Envia evento para Google Analytics
- Navega baseado no tipo:
  - `curso`: `/servicos/cursos/{id}`
  - `job`: `/servicos/empregos/{id}`
  - `servico`: `/servicos/categoria/{category}/{slug}`
  - `link_externo`: Abre bottom sheet de confirmação

### 5. Links Externos Hardcoded (`constants/external-search-links.ts`)

Lista de links externos que aparecem com prioridade:

**Estrutura:**
```typescript
interface ExternalSearchLink {
  titulo: string
  tipo: 'link_externo'
  url: string
  descricao: string
  palavras_chave: string[]
  id?: string
}
```

**Exemplo:**
- Jaé - Sistema de Bilhetagem Digital
- Rock in Rio 2026

## Fluxo de Funcionamento

### 1. Busca Manual

```
Usuário digita → Debounce (500ms) → handleSearch()
  ↓
Filtra hardcoded → Busca API → Mescla resultados
  ↓
Atualiza URL → Salva no histórico → Exibe resultados
```

### 2. Busca via URL

```
Acessa /busca?q=termo → useSearch detecta query param
  ↓
Carrega query do URL → Executa busca automaticamente
  ↓
Exibe resultados → Preenche input
```

### 3. Navegação do Navegador

```
Botão voltar/avançar → URL muda → useSearch detecta mudança
  ↓
Sincroniza estado → Executa busca se necessário
  ↓
Atualiza resultados
```

## Sincronização com URL

### Implementação

A busca é sincronizada com a URL através do query parameter `q`:

- **Ao buscar**: URL é atualizada com `?q=termo`
- **Ao limpar**: Query param é removido
- **Ao carregar**: Se houver `?q=termo`, busca é executada automaticamente
- **Navegação**: Estado sincronizado com URL (back/forward)

### Prevenção de Loops

Para evitar loops infinitos:
- Flag `isUpdatingUrl` indica quando estamos atualizando a URL
- Ref `currentQueryRef` compara queries sem causar re-renders
- Verificação antes de executar busca a partir da URL

## Segurança Implementada

### 1. Sanitização de Input

**Normalização de Texto:**
- Remove caracteres especiais e acentos
- Converte para minúsculas
- Remove espaços extras
- Previne injeção de caracteres maliciosos

**Validação de Tamanho:**
- Busca só é executada se query tiver mais de 2 caracteres
- Previne buscas vazias ou muito curtas

### 2. Validação de URL

**Links Externos:**
- URLs são validadas antes de serem abertas
- Bottom sheet de confirmação antes de redirecionar
- Uso de `window.open(url, '_blank')` para abrir em nova aba
- Previne redirecionamentos automáticos maliciosos

**Navegação Interna:**
- Validação de rotas antes de navegar
- Verificação de domínio para referrer
- Prevenção de navegação para rotas filhas inválidas

### 3. Proteção contra XSS

**React Escaping:**
- React automaticamente escapa conteúdo renderizado
- Valores de busca são tratados como strings, não HTML
- Previne injeção de scripts maliciosos

**URL Encoding:**
- Query params são codificados com `encodeURIComponent()`
- Previne manipulação maliciosa de URLs

### 4. Gerenciamento de Estado Seguro

**localStorage:**
- Validação de dados ao carregar histórico
- Try/catch para parsing de JSON
- Limpeza automática de dados corrompidos
- Limite de 10 itens no histórico

**Session Storage:**
- Validação de rotas antes de usar
- Verificação de formato de URL
- Fallback seguro em caso de erro

### 5. Tratamento de Erros

**API Errors:**
- Try/catch em todas as chamadas de API
- Fallback para resultados hardcoded em caso de erro
- Logging de erros para debugging
- Usuário sempre vê resultados (mesmo que apenas hardcoded)

**Validação de Dados:**
- Verificação de tipos antes de processar
- Validação de existência de campos obrigatórios
- Tratamento graceful de dados ausentes

### 6. Prevenção de Ataques

**Rate Limiting (via Debounce):**
- Debounce de 500ms previne requisições excessivas
- Limita número de chamadas à API
- Reduz carga no servidor

**Validação de Origem:**
- Verificação de `document.referrer` antes de usar
- Validação de domínio para navegação
- Prevenção de redirecionamentos maliciosos

## Melhorias Futuras

### 1. Performance

**Cache de Resultados:**
- Implementar cache de resultados de busca
- Reduzir chamadas à API para queries repetidas
- Cache com TTL (Time To Live) configurável

**Lazy Loading:**
- Carregar mais resultados sob demanda (pagination)
- Virtual scrolling para listas grandes
- Otimização de re-renders com React.memo

**Otimização de Bundle:**
- Code splitting para componentes de busca
- Lazy loading de helpers pesados
- Tree shaking de dependências não utilizadas

### 2. Funcionalidades

**Busca Avançada:**
- Filtros por tipo (curso, serviço, emprego)
- Filtros por categoria
- Ordenação de resultados (relevância, data, etc.)

**Sugestões de Busca:**
- Autocomplete com sugestões
- Busca por voz
- Busca por imagem (OCR)

**Histórico Melhorado:**
- Histórico com timestamps
- Agrupamento por data
- Exportação/importação de histórico

**Resultados Personalizados:**
- Baseado em histórico do usuário
- Baseado em localização
- Baseado em preferências

### 3. UX/UI

**Feedback Visual:**
- Animações de transição
- Skeleton loaders mais elaborados
- Indicadores de progresso

**Acessibilidade:**
- Navegação por teclado melhorada
- Screen reader support
- Alto contraste
- Tamanho de fonte ajustável

**Mobile:**
- Gestos de swipe
- Pull to refresh
- Otimização para telas pequenas

### 4. Analytics e Monitoramento

**Métricas:**
- Taxa de sucesso de buscas
- Queries mais populares
- Tempo médio de resposta
- Taxa de cliques em resultados

**A/B Testing:**
- Testar diferentes algoritmos de busca
- Testar diferentes layouts
- Testar diferentes estratégias de ranking

### 5. Segurança Adicional

**Rate Limiting no Backend:**
- Implementar rate limiting no servidor
- Prevenir abuso de API
- Proteção contra DDoS

**Validação de Conteúdo:**
- Sanitização mais rigorosa de inputs
- Validação de URLs com lista branca
- Verificação de conteúdo malicioso

**Auditoria:**
- Logging de todas as buscas
- Rastreamento de ações do usuário
- Alertas para comportamentos suspeitos

### 6. Internacionalização

**Multi-idioma:**
- Suporte para múltiplos idiomas
- Tradução de stop words
- Normalização específica por idioma

**Localização:**
- Formatação de datas/números
- Timezone handling
- Moeda e unidades

### 7. Machine Learning

**Ranking Inteligente:**
- Aprendizado de preferências do usuário
- Melhoria contínua de relevância
- Detecção de intenção de busca

**Recomendações:**
- Sugestões baseadas em ML
- Detecção de padrões
- Personalização avançada

## Testes Recomendados

### Testes Unitários
- Funções de normalização
- Funções de filtro
- Funções de merge
- Funções de histórico

### Testes de Integração
- Fluxo completo de busca
- Sincronização com URL
- Navegação entre resultados
- Histórico de buscas

### Testes E2E
- Busca manual
- Busca via URL compartilhada
- Navegação do navegador
- Links externos

### Testes de Performance
- Tempo de resposta
- Uso de memória
- Tamanho do bundle
- Otimização de re-renders

## Conclusão

A feature de busca foi implementada seguindo as melhores práticas de React, TypeScript e Next.js, com foco em:

- **Segurança**: Múltiplas camadas de validação e sanitização
- **Performance**: Debounce, otimizações e estrutura eficiente
- **UX**: Interface intuitiva, feedback visual e acessibilidade
- **Manutenibilidade**: Código organizado, tipado e documentado
- **Escalabilidade**: Arquitetura preparada para crescimento

A implementação atual fornece uma base sólida que pode ser expandida com as melhorias sugeridas conforme as necessidades do projeto evoluem.


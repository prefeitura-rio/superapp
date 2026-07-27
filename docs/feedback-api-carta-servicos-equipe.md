# Feedback de integração - API Carta de Serviços (Pref.Rio)

**Data:** 27/07/2026
**Ambiente testado:** `dev-pref-rio-carta-servicos-sys-api` (CloudHub)

---

## 1. Contexto

Estamos migrando a navegação de **Serviços** do pref.rio da API legada `app-busca-search` para a nova **API Carta de Serviços**. A integração está implementada atrás da feature flag `CARTA_SERVICOS_API_ENABLED` (desligada em produção até validação completa).

**Telas impactadas:**

| Rota                                          | Uso                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `/`                                         | Grid de categorias (temas) na home                                         |
| `/servicos/categoria/{slug}`                | Título da categoria, cards “Mais acessados”, accordion de subcategorias |
| `/servicos/categoria/{slug}/{service-slug}` | Página de detalhe do serviço                                             |

**Escopo desta integração:** apenas consulta (GET). Busca global (`/busca`) continua na API app-catalogo. Isso é impeditivo de subirmos para produção essa integração, para não haver dessincronia busca x navegação. Em breve, vamos deixar de puxar direto desses endpoints da SF, para centralizar tudo na app-catalogo, inclusive a busca global. Pendente: Equipe do Bruno Almeida assumir a API app-catalogo.

---

## 2. Endpoints consumidos pelo frontend

| # | Método | Endpoint                                | Finalidade no portal                                                                                                     |
| - | ------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1 | GET     | `/themes`                             | Listar categorias na home                                                                                                |
| 2 | GET     | `/themes?filter_category={themeSlug}` | Top serviços da categoria (“Mais acessados”) - Por ora são os 4 primeiros, sem critério. Pro futuro: add critério. |
| 3 | GET     | `/themes/{themeSlug}/subthemes`       | Listar subcategorias no accordion                                                                                        |
| 4 | GET     | `/subthemes/{subthemeSlug}/services`  | Serviços ao expandir uma subcategoria                                                                                   |
| 5 | GET     | `/services/{serviceSlug}`             | Página de detalhe do serviço                                                                                           |

---

## 3. Requisitos transversais (todos os endpoints)

| Item                           | O que o frontend precisa                                                                            | Situação observada                                                                       | Ação esperada da API                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Content-Type**         | Resposta JSON parseável com`Content-Type: application/json` (ou `application/*+json`)          | Algumas respostas chegam como texto; tivemos que fazer fallback de`JSON.parse` no client | Garantir header JSON correto em todos os endpoints                                                      |
| **Corpo JSON**           | Objeto JSON (não string escapada)                                                                  | OK após parse                                                                             | Manter                                                                                                  |
| **Slugs obrigatórios**  | Todo tema, subtema e serviço publicado deve ter`slug` não nulo, único e estável               | Tema**Trânsito** retornou `"slug": null`                                          | Corrigir dados; slug é chave de rota e de query`filter_category`                                     |
| **Serviços publicados** | Endpoints públicos devem retornar**somente** conteúdo publicado                             | Vários serviços com`articleStatus: null`                                               | Definir contrato:`Online` = publicado, `Draft` = oculto; **não retornar null em produção** |
| **Paginação**          | `meta.page`, `meta.per_page`, `meta.total`, `meta.total_pages` quando houver lista paginada | Parcialmente presente                                                                      | Padronizar em todos os list endpoints                                                                   |
| **Redirect de slug**     | `GET /services/{slug}` → `301` + slug correto quando slug antigo                               | Spec prevê; não testamos em massa                                                        | Manter para não quebrar links indexados                                                                |

---

## 4. Detalhamento por endpoint

### 4.1 `GET /themes` — Listagem de categorias (home)

**Chamada no frontend:**

```
GET /themes?include_empty=false&per_page=100
```

**Uso na UI:** cards de categorias na home (`/`).

| Campo retornado              | Obrigatório | Uso no frontend                                                     | Observação                                          |
| ---------------------------- | ------------ | ------------------------------------------------------------------- | ----------------------------------------------------- |
| `data[].name`              | Sim          | Label do card + mapeamento de ícone                                | —                                                    |
| `data[].slug`              | Sim          | Filtros internos,`filter_category`, subthemes                     | **Crítico** — ver Trânsito                   |
| `data[].publishedServices` | Sim          | Ocultar categorias vazias; ordenação (substituto de popularidade) | Antiga API tinha`popularity_score`; usamos contagem |
| `data[].subthemesCount`    | Não         | Não exibido hoje                                                   | —                                                    |
| `meta.*`                   | Desejável   | Paginação futura                                                  | —                                                    |

**Query params usados:**

| Param             | Valor     | Efeito esperado                           |
| ----------------- | --------- | ----------------------------------------- |
| `include_empty` | `false` | Não listar temas sem serviços           |
| `per_page`      | `100`   | Trazer todas as categorias em uma página |

**Pendência da API:**

| Prioridade | Item                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Baixa      | Expor`popularity_score` ou critério de ordenação equivalente (hoje ordenamos por `publishedServices`) |
| Alta       | Garantir`slug` preenchido em 100% dos temas publicados                                                     |

---

### 4.2 `GET /themes?filter_category={themeSlug}` — Serviços da categoria (“Mais acessados”)

**Chamada no frontend:**

```
GET /themes?filter_category=cidade&page=1&per_page=20
```

**Uso na UI:** até 4 cards coloridos no topo de `/servicos/categoria/{slug}`.

#### Contrato que o frontend espera (comportamento atual do portal legado)

O body deve conter um bloco **`filtered_category`** com a lista de serviços:

```json
{
  "filtered_category": {
    "name": "Cidade",
    "slug": "cidade",
    "page": 1,
    "per_page": 4,
    "total_services": 14,
    "services": [ { ... } ]
  },
  "meta": { ... },
  "data": [ /* lista de temas — pode coexistir */ ]
}
```

**Pendência da API:**

| Prioridade     | Item                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| **Alta** | Formalizar contrato de resposta com`filter_category` (ou migrar spec para esse shape) |

---

### 4.3 `GET /themes/{themeSlug}/subthemes` — Subcategorias

**Chamada no frontend:**

```
GET /themes/cidade/subthemes?per_page=100
```

**Uso na UI:** accordion em `/servicos/categoria/cidade`.

| Campo retornado              | Obrigatório | Uso no frontend                              | Observação |
| ---------------------------- | ------------ | -------------------------------------------- | ------------ |
| `data[].name`              | Sim          | Label do accordion                           | —           |
| `data[].slug`              | Sim          | Chave do accordion + chamada ao endpoint 4.4 | —           |
| `data[].publishedServices` | Sim          | Ocultar subtemas vazios; ordenação         | —           |
| `meta.*`                   | Desejável   | Paginação                                  | —           |

**Query params usados:**

| Param        | Valor   |
| ------------ | ------- |
| `per_page` | `100` |

**Pendência da API:**

| Prioridade | Item                                            |
| ---------- | ----------------------------------------------- |
| Alta       | `slug` obrigatório em todo subtema publicado |

---

### 4.4 `GET /subthemes/{subthemeSlug}/services` — Serviços por subcategoria

**Chamada no frontend:**

```
GET /subthemes/limpeza-urbana/services?page=1&per_page=50
```

**Pendência da API:**

| Prioridade | Item                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Alta       | Garantir que rascunhos (`Draft`) não apareçam em endpoints públicos             |
| Alta       | `summary` até onde eu sei é campo obrigatório então deve ser sempre retornado. |

---

### 4.5 `GET /services/{serviceSlug}` — Detalhe do serviço

**Chamada no frontend:**

```
GET /services/controle-de-roedores-1
```

**Uso na UI:** página completa em `/servicos/categoria/{cat}/{serviceSlug}`.

#### Envelope esperado

```json
{
  "data": { /* ServiceDetail */ }
}
```

#### Campos usados na UI (mapeados do objeto `data`)

**Cabeçalho e cards rápidos**

| Campo API                                                | Seção da UI                     | Obrigatório p/ UX mínima | Observação runtime                    |
| -------------------------------------------------------- | --------------------------------- | -------------------------- | --------------------------------------- |
| `name`                                                 | Título (H1)                      | Sim                        | OK                                      |
| `info.summary`                                         | Resumo abaixo do título          | Desejável                 | **`null`** em vários serviços |
| `info.cost`                                            | Card “Custo”                    | Desejável                 | `null`                                |
| `info.serviceDeadline`                                 | Card “Tempo de atendimento”     | Desejável                 | `null`                                |
| `themeName`                                            | Card “Categoria”                | Desejável                 | OK                                      |
| `responsibleOrgUnit` / `responsibleOrgUnitShortName` | Card “Órgão gestor”           | Desejável                 | OK (string, não ID numérico)          |
| `channels[]` (Presencial)                              | Card “Endereço”                | Desejável                 | Vazio em exemplo testado                |
| `channels[]` (Digital/Telefone)                        | Seção “Canais de atendimento” | Desejável                 | Vazio em exemplo testado                |

**Principais informações (blocos de texto)**

| Campo API                       | Bloco na UI                 | Obrigatório p/ UX mínima | Observação runtime |
| ------------------------------- | --------------------------- | -------------------------- | -------------------- |
| `info.fullDescription`        | Descrição completa        | Desejável                 | **`null`**   |
| `howToRequest.instructions`   | Como solicitar              | Desejável                 | **`null`**   |
| `howToRequest.serviceResult`  | Resultado da solicitação  | Desejável                 | **`null`**   |
| `howToRequest.requiredDocs[]` | Documentos necessários     | Desejável                 | `[]`               |
| `howToRequest.exclusions`     | O que o serviço não cobre | Opcional                   | `null`             |

**Ações e rodapé**

| Campo API                              | Seção da UI                   | Obrigatório p/ UX mínima | Observação                                     |
| -------------------------------------- | ------------------------------- | -------------------------- | ------------------------------------------------ |
| `buttons[].title`                    | CTA principal / cards de ação | Desejável                 | `[]` no exemplo                                |
| `buttons[].url`                      | Link do botão                  | Sim (se botão existir)    | —                                               |
| `buttons[].description`              | Subtítulo do card multi-botão | Opcional                   | —                                               |
| *(ausente)* `buttons[].is_enabled` | Filtrar botões desativados     | —                         | **Gap:** frontend assume todos habilitados |
| `legislation[].titulo`               | Seção Legislação            | Opcional                   | `[]`                                           |
| `lastModifiedDate`                   | “Última atualização”       | Opcional                   | **`null`**                               |

**Metadados / navegação**

| Campo API                          | Uso                          | Observação                                         |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------- |
| `slug`                           | Rota canonical               | OK                                                   |
| `slugHistory[]`                  | Redirect 301                 | Spec OK                                              |
| `themeSlug`, `themeName`       | Contexto / breadcrumb futuro | OK                                                   |
| `subthemeSlug`, `subthemeName` | Contexto                     | OK                                                   |
| `serviceCatalogId`               | ID estável do serviço      | OK                                                   |
| `articleStatus`                  | Controle de publicação     | **`null`** — causou 404 antes do workaround |

**Exemplo real testado:** `GET /services/controle-de-roedores-1`
Retornou `200` com `name`, `themeName`, `subthemeName`, `responsibleOrgUnit*`, mas **`info.*` e `howToRequest.*` majoritariamente null/vazios** — a página abre, porém com conteúdo muito pobre vs. produção atual.

**Pendência da API:**

| Prioridade     | Item                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Alta** | `articleStatus: "Online"` em todo serviço retornado pelo endpoint público (nunca `null`)                      |
| **Alta** | Preencher campos de conteúdo Salesforce em`info` e `howToRequest` para serviços publicados                    |
| Média         | Popular`channels[]` e `buttons[]` quando existirem no catálogo                                                 |
| Baixa          | Adicionar`is_enabled` (ou equivalente) em `buttons[]`- Ver se faz sentido manter, caso contrário não precisa! |
| Baixa          | Preencher`lastModifiedDate` / `lastPublishedDate`                                                               |

---

## 5. Estrutura de `channels[]` (detalhe)

O frontend monta duas listas a partir de `channels[]`:

| `type`                   | Campos usados                                 | Renderização                     |
| -------------------------- | --------------------------------------------- | ---------------------------------- |
| `Presencial`             | `endereco` ou `titulo`; bonus: `mapUrl` | Card de endereço (Maps + copiar)  |
| `Digital` / `Telefone` | `value`, `channelType`, `whatsappLink`  | Lista copiável de canais digitais |

**Pedido:** quando o serviço tiver canais no Salesforce, garantir que `channels[]` venha populado conforme spec (`order`, `type`, `endereco`, `titulo`, `value`, `channelType`, `mapUrl`, `whatsappLink`).

---

## 6. Resumo — pendências priorizadas da API

| Prioridade   | Endpoint(s)                               | Pendência                                                                                        |
| ------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **P0** | Todos                                     | `Content-Type: application/json` consistente                                                    |
| **P0** | `/themes`, `/themes/{slug}/subthemes` | `slug` nunca null em temas/subtemas publicados                                                  |
| **P0** | `/services/{slug}`                      | `articleStatus` explícito (`Online` / `Draft`); serviços públicos = `Online`           |
| **P0** | `/services/{slug}`                      | Preencher`info.summary`, `info.fullDescription`, `howToRequest.*` para serviços publicados |
| **P1** | `/themes?filter_category=`              | Alinhar OpenAPI com runtime (`filtered_category.services` vs `data[]`)                        |
| **P2** | `/services/{slug}`                      | `channels[]`, `buttons[]`, datas de modificação                                             |
| **P3** | `/services/{slug}`                      | `buttons[].is_enabled`ver se implementamos ou não (VERIFICAR)                                  |

---

## 7. O que já funciona com workarounds no frontend

Para transparência, estes pontos **já temos tratamento temporário** — mas idealmente a API deveria corrigir na origem:

| Workaround                                             | Motivo                       |
| ------------------------------------------------------ | ---------------------------- |
| Parse JSON quando body chega como string               | Content-Type incorreto       |
| Ler`filtered_category.services` em vez de `data[]` | Divergência spec × runtime |
| `articleStatus null` → tratar como publicado        | Evitar 404 indevido          |
| `summary null` → string vazia                       | Cards/listas não quebram    |
| `theme.slug null` → fallback derivado do nome       | Tema Trânsito               |
| Ordenação por`publishedServices`                   | Sem`popularity_score`      |

---

## 8. Referências internas (equipe frontend)

- Spec OpenAPI local: `pref-rio-carta-servicos-api.yaml`
- Mappers: `src/lib/carta-servicos/mappers.ts`
- Comparativo detalhe: `docs/migration-carta-servicos-service-detail.md`
- Feature flag: `CARTA_SERVICOS_API_ENABLED` (`.env.example`)

---

## 9. Contato / próximos passos sugeridos

1. API confirma contrato final de `GET /themes?filter_category=` (shape oficial).
2. API corrige slugs nulos e `articleStatus` em staging.
3. Repetimos teste de paridade visual nas 3 rotas (`/`, categoria, detalhe) com amostra de ~10 serviços.
4. Frontend liga `CARTA_SERVICOS_API_ENABLED=true` em staging → homologação → produção.

---

*Documento gerado a partir da integração em andamento no repositório superapp (pref.rio).*

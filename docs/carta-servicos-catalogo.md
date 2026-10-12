# Carta de Serviços — app-catalogo

Decisões e dívidas da navegação de serviços quando `CARTA_SERVICOS_API_ENABLED=true`.

Com a flag desligada (padrão), o portal continua em `app-busca-search`. Com a flag ligada, categorias, subcategorias, listagem e detalhe saem da app-catalogo (`BASE_API_URL_APP_CATALOGO`), não mais da API MuleSoft/Salesforce. O client `src/http-pref-rio-carta-servicos/` permanece no repositório; o caminho da flag não o chama.

O comparativo histórico busca-search → MuleSoft está em [`migration-carta-servicos-service-detail.md`](./migration-carta-servicos-service-detail.md).

## O que a flag liga hoje

| Uso no portal | Endpoint app-catalogo |
| --- | --- |
| Categorias (home) | `GET /api/public/themes` |
| Subcategorias de uma categoria | `GET /api/public/themes/{slug}/subthemes` |
| Serviços de uma subcategoria | `GET /api/public/subthemes/{slug}/services` |
| Detalhe do serviço | `GET /api/public/services/{slug}` |
| Cards “Mais acessados” | Composição no frontend (ver dívida abaixo). A app-catalogo não tem `filter_category`. |

Os payloads de lista e detalhe são lidos com os models da spec MuleSoft (`Theme`, `Subtheme`, `ServiceListItem`, `ServiceDetail`). O client gerado da app-catalogo tipa `data` como `unknown`.

## Dívidas

### 1. OpenAPI da carta sem models

`docs/openapi-v3.json` da app-catalogo declara `v1.cartaPagedJSON.data` sem schema e `v1.cartaDetailJSON.data` como objeto livre (`Data any` no swag). O superapp assume o shape CloudHub/MuleSoft até a app-catalogo declarar os schemas. Aí regenerar o Orval (`npx orval --project appCatalogo`) e apertar o parse em `src/lib/carta-servicos/fetch.ts`. Não editar `src/http-app-catalogo/` à mão.

### 2. Destaques por categoria (“Mais acessados”)

A página `/servicos/categoria/{slug}` mostra 4 cards. Na API MuleSoft isso vinha de `GET /themes?filter_category={themeSlug}` (os 4 primeiros, sem critério de popularidade).

Provisório no frontend: subtemas ordenados por `publishedServices`, e serviços de cada um (`per_page=4`) até juntar 4 slugs. A ordem é a da API (título), não acesso nem destaque. `filtered_category.total_services` nesse caminho é a quantidade de cards montados, não o total da categoria.

Futuro, na origem dos dados:

- Salesforce cria uma flag de destaque no serviço.
- A app-catalogo, que sincroniza a Carta, passa a expor isso. Duas formas aceitáveis: um endpoint de destaques por tema, ou os 4 primeiros já filtrados em `GET /api/public/themes/{slug}/subthemes` (o backend filtra e devolve).
- O superapp troca a composição local por essa resposta.

### 3. Botão “Solicitar serviço”

O CTA exige `flags.activeCategoryConfigId` (e usa `allowsAnonymity`). O struct Go `CartaServiceFlags` no sync só persiste `allowsAnonymity` e `allowTicketSubmission`. `activeCategoryConfigId` e `activeCategoryName` se perdem ao gravar `source_data`. Sem o id, a página cai nos botões genéricos do serviço.

Corrigir na app-catalogo, preservando esses campos no payload sincronizado. O frontend já lê `flags` quando o id vem no detalhe.

### 4. Redirect de slug

Links antigos precisam continuar abrindo o serviço quando o slug muda. A API pública da app-catalogo busca só `external_id` (slug canônico) e responde 404 no slug antigo. O redirect é resolvido no sync, não no GET público.

Implementar na app-catalogo: `GET /api/public/services/{slug}` com status `301` e corpo `{ "redirect": "<slug-canonico>" }` (o mesmo contrato que o frontend já trata em `fetchCartaServicosServiceBySlug`). No superapp, o `fetch` dessa rota precisa de `redirect: 'manual'`, senão o runtime segue o 301 e o status some. Esse ajuste entra junto com a API.

### 5. Campos a mais que o resumo e o detalhe ainda não garantem

- A listagem por subtema não traz `serviceCatalogId`. O mapper usa o slug como id. A UI do accordion só precisa de slug, nome, resumo e status.
- `GET /api/public/services/{slug}` não filtra `status = active`. Um rascunho ainda presente em `catalog_items` pode voltar no detalhe. A página, com a flag ligada, confia na API e não aplica a whitelist da busca-search.

### 6. Busca: clique no serviço abre link externo

`GET /api/public/search` de um serviço da Carta devolve `metadata.slug` e não devolve a categoria. Exemplo real (`q=iptu`): o item "IPTU 2026" vem com `metadata: { "slug": "iptu-2026" }` e `url: "https://prefeitura.rio/servicos/iptu-2026"`.

`sanitizedSearchMetadata` (`internal/services/search_service.go`) só copia `id`, `slug` e, para `type=service`, `tema_geral`, `tema_especifico` e `Tema__c`. O `source_data` sincronizado da Carta usa `themeSlug` e `themeName`. Essas chaves não entram no metadata.

O superapp (`handleCatalogItemClick`) só navega para `/servicos/categoria/{categoria}/{slug}` quando `metadata.slug` e `metadata.tema_geral` existem. Sem a categoria, o clique abre o bottomsheet com a `url` externa. O detalhe em si é carregado pelo slug; o segmento de categoria é só a rota.

`tags[0]` costuma ser o nome do tema (`buildCartaTags` coloca `ThemeName` primeiro: no exemplo, `"Tributos"`), mas não é contrato. Se o tema vier vazio, a primeira tag pode ser subtema, custo ou sigla.

**Na app-catalogo:** incluir `themeSlug` e `themeName` no metadata dos itens `type=service`, lendo as chaves reais do `source_data`. **No superapp, depois disso:** usar `themeSlug` (ou `themeName`) no lugar de `tema_geral` para montar a rota interna.

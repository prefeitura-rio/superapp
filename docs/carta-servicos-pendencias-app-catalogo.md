Título

Carta de Serviços: completar o contrato público da app-catalogo

Descrição

O portal do cidadão passa a ler a Carta de Serviços pela app-catalogo (temas, subtemas, serviços e detalhe), no lugar da API MuleSoft. Os endpoints públicos já existem. Este card fecha o que ainda falta na app-catalogo e o ajuste correspondente no Salesforce, para a navegação e a busca não perderem informação.

Escopo: app-catalogo e Salesforce.

## 1. Tipar as respostas no OpenAPI

Os quatro GETs existem, mas o spec publicado não descreve o corpo. `v1.cartaPagedJSON.data` sai sem schema (`Data any` no swag) e `v1.cartaDetailJSON.data` sai como objeto livre.

Tipar com o shape CloudHub que o sync já grava em `source_data`.

- `GET /api/public/themes` — `data[]`: `slug`, `name`, `subthemesCount`, `publishedServices`
- `GET /api/public/themes/{slug}/subthemes` — `data[]`: `slug`, `name`, `publishedServices`
- `GET /api/public/subthemes/{slug}/services` — `data[]`: resumo do serviço (ver item 5)
- `GET /api/public/services/{slug}` — `data`: detalhe completo, com `info`, `howToRequest`, `channels`, `buttons`, `legislation` e `flags`

Listas no envelope `{ data, meta }`, com `meta.page`, `meta.per_page`, `meta.total` e `meta.total_pages`.

Publicar o `docs/openapi-v3.json` atualizado.

## 2. Destaques por tema

A página de uma categoria mostra 4 serviços em destaque. A API MuleSoft entregava isso em `GET /themes?filter_category={themeSlug}`. A app-catalogo não tem equivalente. Hoje não dá para distinguir destaque de “primeiros por título”.

Salesforce: criar uma flag de destaque no serviço. Alinhar com o Bruno se já entra agora quais serão esses principais serviços por categoria.

app-catalogo: sincronizar a flag e expor os destaques. Uma das duas formas:

- endpoint de destaques de um tema, ou
- os serviços em destaque já filtrados na resposta de `GET /api/public/themes/{slug}/subthemes`

O contrato precisa deixar claro quais são os destaques e limitar a 4 por tema.

## 3. Não descartar o id do chamado no sync

`GET /api/public/services/{slug}` devolve `data.flags`, mas o struct `CartaServiceFlags` só persiste `allowsAnonymity` e `allowTicketSubmission`. Ao remarcar o `source_data`, somem `activeCategoryConfigId` e `activeCategoryName`.

Gravar os dois no `source_data` e devolvê-los em `data.flags` quando a origem tiver valor. O `activeCategoryConfigId` é o id que abre o formulário de solicitação do serviço.

## 4. Redirect de slug antigo

A API da Carta (SF)) já responde `301` com `{ "redirect": "<slug-canonico>" }` e o detalhe já traz `slugHistory`. Não criar isso no Salesforce.

O sync já segue esse `301` em `GetServiceCanonical` e grava o serviço no slug novo. Quando o slug mudou, `SyncRecord` dá `SoftDelete` no slug antigo, e o `GET /api/public/services/{slug}` só busca `external_id`. O slug antigo responde 404. O `slugHistory` vai para o `source_data` e não é usado como índice.

Guardar o mapeamento que o sync já descobre (slug antigo para slug canônico, a partir do `301` e do `slugHistory`) e parar de apagar o slug antigo sem deixar esse índice. Quando o slug pedido for um antigo, responder `301` com corpo JSON, lido do banco local, sem chamar a Carta na leitura:

```json
{ "redirect": "<slug-canonico>" }
```

O status 301 e esse JSON precisam chegar ao cliente. Não transformar isso num redirect HTTP com header `Location`, porque o client segue o redirect e o 301 some.

## 5. Resumo da listagem e detalhe só de publicado

`GET /api/public/subthemes/{slug}/services` não devolve `serviceCatalogId`. Incluir `serviceCatalogId` e, quando existir no payload, `articleId`.

`GET /api/public/services/{slug}` não filtra `status = active`. Rascunho ainda gravado em `catalog_items` volta no detalhe público. Serviço que não está publicado deve responder `404`.

## 6. Busca: devolver o tema do serviço

`GET /api/public/search` de um serviço da Carta devolve `metadata.slug` e não devolve o tema. Exemplo real, `q=iptu`:

```json
{
  "title": "IPTU 2026",
  "url": "https://prefeitura.rio/servicos/iptu-2026",
  "metadata": { "slug": "iptu-2026" },
  "tags": ["Tributos", "IPTU", "SMFP"]
}
```

`sanitizedSearchMetadata` (`internal/services/search_service.go`) copia `id`, `slug` e, para `type=service`, `tema_geral`, `tema_especifico` e `Tema__c`. O `source_data` da Carta usa `themeSlug` e `themeName`, então essas chaves não entram no metadata.

`tags[0]` às vezes é o nome do tema (`buildCartaTags` coloca `ThemeName` primeiro), mas não é contrato: a primeira tag também pode ser subtema, custo ou sigla.

Incluir `themeSlug` e `themeName` no `metadata` dos itens `type=service` vindos da Carta, lidos das chaves reais do `source_data`. Sem o `themeSlug`, o resultado da busca não tem como abrir a página do serviço e cai na `url` externa.

## Pronto quando

- O OpenAPI publicado descreve o `data` dos quatro GETs da carta.
- Dá para obter até 4 serviços em destaque de um tema, a partir da flag do Salesforce.
- `GET /api/public/services/{slug}` devolve `flags.activeCategoryConfigId` e `flags.activeCategoryName` quando a origem tiver esses campos.
- Slug antigo do mesmo serviço responde `301` com `{ "redirect": "<slug-canonico>" }`.
- Detalhe público não devolve rascunho. A listagem por subtema inclui `serviceCatalogId`.
- Busca de serviço da Carta inclui `metadata.themeSlug` e `metadata.themeName`.

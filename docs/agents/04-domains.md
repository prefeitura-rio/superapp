# 04 — Domínios e feature flags

## Domínios principais

| Domínio | Rotas âncora | Código / client |
|---------|--------------|-----------------|
| Home | `/` | `(logged-in-out)/(home)/` |
| Carta de serviços | `/servicos`, categorias | `(logged-in-out)/servicos/`, `http-busca-search/` |
| Carta de serviços (Lei 13.460, PDF por órgão) | `/carta-de-servicos`, `/carta-de-servicos/[siciCode]`, `/api/carta-de-servicos/[siciCode]/pdf` | `(logged-in-out)/carta-de-servicos/`, `src/lib/carta-servicos/org-units.ts`, `src/lib/carta-servicos/pdf/`, `http-app-catalogo/` |
| Cursos | `/servicos/cursos`, `[slug]`, `meus-cursos`, certificados, inscrição | `src/app/components/courses/`, `http-courses/` |
| Empregos | `/servicos/trabalho`, `[id]`, currículo, candidaturas, `/servicos/empresas/[cnpj]` | componentes empregos + `http-courses/` |
| MEI | `/servicos/mei`, proposta, minhas propostas, meu-mei | componentes mei + `http-courses/` |
| Busca | `/busca` | `http-app-catalogo/` / busca-search |
| Carteira digital | `/carteira`, pet, cadunico, clínica da família, CadMicro (`/carteira/cadmicro`)… | `(logged-in)/carteira/` |
| Perfil | `/meu-perfil`, dados pessoais, endereço, avatar | `src/actions/`, `http/` (RMI) |
| FAQ / Ouvidoria | `/faq`, `/ouvidoria` | rotas mistas |
| Auth UX | `/sessao-expirada`, `/autenticacao-necessaria/*` | `(logged-out)/` |
| Dívida Ativa | `/divida-ativa` | `(logged-in)/divida-ativa/`, `http-divida-ativa/` |
| Termos de uso | `/termos-de-uso`, `/termos-de-uso/[plataforma]` (públicas) | `(logged-in-out)/termos-de-uso/`, conteúdo em `src/constants/termos-de-uso/` |

Redirect legado: `/oportunidadescariocas*` → trabalho (middleware).

### Termos de uso: trocar o texto de uma plataforma

O texto é conteúdo, não componente. As 5 plataformas (lista e slugs em `src/constants/termos-de-uso/platforms.ts`) têm cada uma uma entrada em `TERMOS_DE_USO_CONTENT` (`src/constants/termos-de-uso/content/index.ts`), com `parts` (texto), `version` e `updatedAt`. Hoje todas apontam para o texto provisório v1.0 (`content/pref-rio-v1.ts`, copiado de `/servicos/trabalho/termos-de-uso`).

Para trocar o texto de uma plataforma: criar o arquivo do texto em `content/` (um `TermosDeUsoPart[]`, mesmo formato de `pref-rio-v1.ts`), apontar `parts` da entrada para ele e atualizar `version`/`updatedAt`. O subtítulo "Última atualização: … - Versão …" sai desses campos. Não mexer em `termos-de-uso-detail.tsx`. O mapa é tipado pelos slugs: plataforma sem entrada não compila.

Testes: `termos-de-uso/__tests__/detail-page.test.tsx` compara o texto v1.0 com a página de Trabalho, frase a frase, e não depende de qual plataforma usa o v1.0. Já `src/constants/termos-de-uso/__tests__/content.test.ts` afirma que cada plataforma está no v1.0: ao trocar o texto de uma, atualize a expectativa dela ali (é a mudança que o teste deve flagrar).

## Feature flags

Controladas principalmente em `src/middleware.ts` e banners (`src/constants/banners.ts`):

- `NEXT_PUBLIC_FEATURE_FLAG` — lista separada por vírgula (`cursos`, `empregos`, `mei`, `cadmicro`). Ausente/`false` em dev/staging costuma liberar tudo. Em produção, ausência de `empregos`/`mei`/`cadmicro` bloqueia segmentos de path `/trabalho`, `/empresas`, `/mei`, `/carteira/cadmicro`.
- `NEXT_PUBLIC_FEATURE_CHAMADOS` / `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA` — booleanos (`=== 'true'`). Ausente ou diferente de `'true'` esconde o módulo inteiro, inclusive em staging. Padrão para superfície que não pode aparecer até a homologação.
- `NEXT_PUBLIC_ENABLE_HARDCODED_SEARCH_LINKS` — `src/constants/venvs.ts`.

Ao adicionar feature gateada: espelhar o padrão existente no middleware e nos banners.

## Docs de domínio

- MEI: [`../mei.md`](../mei.md)
- Busca: [`../search-feature.md`](../search-feature.md)
- Empregabilidade (testes): [`../testes-empregabilidade.md`](../testes-empregabilidade.md)
- Cursos (testes): [`../testes-cursos.md`](../testes-cursos.md)
- Cursos / TanStack: [`../cursos-tanstack-query-migration.md`](../cursos-tanstack-query-migration.md), [`../cursos-home-cache-ssr-tanstack.md`](../cursos-home-cache-ssr-tanstack.md)
- Carteira pet: [`../pt-br/carteira-pet.md`](../pt-br/carteira-pet.md)
- CadMicro GCS upload: [`../cadmicro-gcs-upload.md`](../cadmicro-gcs-upload.md)
- CadMicro API: [`../cadmicro-api-integration.md`](../cadmicro-api-integration.md)
- Dívida Ativa: [`../divida-ativa.md`](../divida-ativa.md)
- Carta de Serviços em PDF (decisão servidor × cliente, limites do react-pdf): [`../carta-de-servicos-pdf.md`](../carta-de-servicos-pdf.md)

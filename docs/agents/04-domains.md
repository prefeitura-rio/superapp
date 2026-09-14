# 04 — Domínios e feature flags

## Domínios principais

| Domínio | Rotas âncora | Código / client |
|---------|--------------|-----------------|
| Home | `/` | `(logged-in-out)/(home)/` |
| Carta de serviços | `/servicos`, categorias | `(logged-in-out)/servicos/`, `http-busca-search/` |
| Cursos | `/servicos/cursos`, `[slug]`, `meus-cursos`, certificados, inscrição | `src/app/components/courses/`, `http-courses/` |
| Empregos | `/servicos/trabalho`, `[id]`, currículo, candidaturas, `/servicos/empresas/[cnpj]` | componentes empregos + `http-courses/` |
| MEI | `/servicos/mei`, proposta, minhas propostas, meu-mei | componentes mei + `http-courses/` |
| Busca | `/busca` | `http-app-catalogo/` / busca-search |
| Carteira digital | `/carteira`, pet, cadunico, clínica da família, CadMicro (`/carteira/cadmicro`)… | `(logged-in)/carteira/` |
| Perfil | `/meu-perfil`, dados pessoais, endereço, avatar | `src/actions/`, `http/` (RMI) |
| FAQ / Ouvidoria | `/faq`, `/ouvidoria` | rotas mistas |
| Auth UX | `/sessao-expirada`, `/autenticacao-necessaria/*` | `(logged-out)/` |
| Dívida Ativa | `/divida-ativa` | `(logged-in)/divida-ativa/`, `http-divida-ativa/` |

Redirect legado: `/oportunidadescariocas*` → trabalho (middleware).

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

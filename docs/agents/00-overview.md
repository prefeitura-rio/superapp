# 00 — Overview do monorepo e limites do superapp

## Papel deste repositório

**superapp** = portal do cidadão (pref.rio). UI pública/autenticada para carta de serviços, cursos, empregos, MEI, busca, carteira digital e perfil.

Contexto completo do ecossistema: [`../../CLAUDE.md`](../../CLAUDE.md) (raiz do monorepo `fs-prefrio`).

## Mapa rápido

| Projeto | Papel | Relação com superapp |
|---------|-------|----------------------|
| **superapp** (este repo) | Portal do cidadão | — |
| **portal-interno** | Backoffice admin | Gerencia conteúdo (cursos, vagas, MEI, serviços). Superapp **consome** o que o backoffice publica via APIs |
| **app-go-api** | API Go (cursos, empregos, MEI, currículo) | Cliente em `src/http-courses/` |
| **app-catalogo** | Busca semântica + recomendações | Cliente em `src/http-app-catalogo/` |
| **app-rmi** | Dados do cidadão / PJ | Cliente em `src/http/` |
| **app-busca-search** | Carta de serviços (busca) | Cliente em `src/http-busca-search/` |
| **superapp-agent-api** | Recursos de agente (ex.: currículo AI) | Cliente em `src/http-agent-api/` |
| **heimdall** | RBAC central | Usado por portal-interno e backends. **Não** pelo superapp |

## Identidade compartilhada

- Keycloak (`idrio_cidadao`, client `superapp`) emite JWTs.
- CPF = `preferred_username` no JWT — identificador do cidadão.
- Heimdall resolve papéis para serviços internos; o cidadão no superapp não passa por Heimdall.

## O que NÃO fazer neste repo

- CRUD admin de cursos/vagas/MEI/serviços → `portal-interno` + `app-go-api`.
- Políticas RBAC / papéis Heimdall → `heimdall` / `portal-interno`.
- Alterar handlers Go, migrations, workers → repositórios de API.
- Assumir que o superapp pode “criar endpoint” no backend — só BFF em `src/app/api/` ou Server Actions que chamam APIs existentes.

## O que SIM fazer neste repo

- Páginas e componentes do App Router.
- Integração com clientes Orval já gerados.
- BFF/proxies em `src/app/api/` quando o browser não deve chamar a API direto.
- Feature flags de superfície (middleware / banners).
- Testes Vitest/Playwright do portal.

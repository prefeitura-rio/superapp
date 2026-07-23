# 00 — Overview do ecossistema e limites do superapp

## Papel deste repositório

**superapp** = portal do cidadão (pref.rio). UI pública/autenticada para carta de serviços, cursos, empregos, MEI, busca, carteira digital e perfil.

Repo GitHub: [prefeitura-rio/superapp](https://github.com/prefeitura-rio/superapp).

> **Ambiente Jira / Claude Code:** o agent trabalha só neste checkout. Não existem pastas irmãs (`../app-go-api`, monorepo local). Para código ou specs de outros serviços, use os links GitHub abaixo (ou o client Orval já gerado em `src/http*`).

## Mapa rápido (repos GitHub)

| Projeto | Papel | Repo | Relação com superapp |
|---------|-------|------|----------------------|
| **superapp** | Portal do cidadão | [prefeitura-rio/superapp](https://github.com/prefeitura-rio/superapp) | este repo |
| **portal-interno** | Backoffice admin | [prefeitura-rio/portal-interno](https://github.com/prefeitura-rio/portal-interno) | Gerencia conteúdo; superapp **consome** via APIs |
| **app-go-api** | API Go (cursos, empregos, MEI, currículo) | [prefeitura-rio/app-go-api](https://github.com/prefeitura-rio/app-go-api) | Cliente `src/http-courses/` |
| **app-catalogo** | Busca semântica + recomendações | [prefeitura-rio/app-catalogo](https://github.com/prefeitura-rio/app-catalogo) | Cliente `src/http-app-catalogo/` |
| **app-rmi** | Dados do cidadão / PJ | [prefeitura-rio/app-rmi](https://github.com/prefeitura-rio/app-rmi) | Cliente `src/http/` |
| **app-busca-search** | Carta de serviços (busca) | [prefeitura-rio/app-busca-search](https://github.com/prefeitura-rio/app-busca-search) | Cliente `src/http-busca-search/` |
| **superapp-agent-api** | Recursos de agente (ex.: currículo AI) | [prefeitura-rio/superapp-agent-api](https://github.com/prefeitura-rio/superapp-agent-api) | Cliente `src/http-agent-api/` |
| **heimdall-frontend** | Admin UI + backend RBAC | [prefeitura-rio/heimdall-frontend](https://github.com/prefeitura-rio/heimdall-frontend) | Usado por portal-interno e backends. **Não** pelo superapp |

OpenAPI úteis (branch staging/main conforme o serviço):

- app-go-api: `https://raw.githubusercontent.com/prefeitura-rio/app-go-api/refs/heads/main/docs/swagger.yaml`
- app-busca-search: `https://raw.githubusercontent.com/prefeitura-rio/app-busca-search/refs/heads/staging/docs/openapi-v3.json`

## Identidade compartilhada

- Keycloak (`idrio_cidadao`, client `superapp`) emite JWTs.
- CPF = `preferred_username` no JWT — identificador do cidadão.
- Heimdall resolve papéis para serviços internos; o cidadão no superapp não passa por Heimdall.
- Infra compartilhada (referência): OTel → SigNoz, Kubernetes + ArgoCD.

## O que NÃO fazer neste repo

- CRUD admin de cursos/vagas/MEI/serviços → [portal-interno](https://github.com/prefeitura-rio/portal-interno) + [app-go-api](https://github.com/prefeitura-rio/app-go-api).
- Políticas RBAC / papéis Heimdall → [heimdall-frontend](https://github.com/prefeitura-rio/heimdall-frontend) / portal-interno.
- Alterar handlers Go, migrations, workers → abrir PR no repo da API correspondente.
- Assumir que o superapp pode “criar endpoint” no backend — só BFF em `src/app/api/` ou Server Actions que chamam APIs existentes.
- Assumir checkout local de outros projetos — no GitHub/Jira só este repo está disponível.

## O que SIM fazer neste repo

- Páginas e componentes do App Router.
- Integração com clientes Orval já gerados.
- BFF/proxies em `src/app/api/` quando o browser não deve chamar a API direto.
- Feature flags de superfície (middleware / banners).
- Testes Vitest/Playwright do portal.
- Documentar no PR qualquer dependência de mudança em outro repositório (com link).

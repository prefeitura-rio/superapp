### Metodologia para gerar http clients com orval

O `orval.config.ts` é **multi-projeto**: uma entrada nomeada por API, permanente e commitada.
Nada de trocar campos na mão e reverter depois.

**Para regenerar um client que já tem projeto:**

```bash
npx orval --project dividaAtiva
```

⚠️ `npx orval` **sem** `--project` regenera todos os projetos do arquivo. Um client que a sua
tarefa não tocou entra no diff, e se o spec remoto dele andou desde a última geração, entra
com mudança de verdade. Use sempre `--project`.

**Para adicionar uma API que ainda não tem projeto:** copie o bloco dela abaixo para uma
entrada nomeada nova no `orval.config.ts` (a chave é o nome do projeto), rode
`npx orval --project <nome>` e **commite a entrada junto** com o client gerado.

Projetos configurados hoje: `prefRioChamadosPublico`, `dividaAtiva`. Os demais blocos abaixo
seguem como receita a migrar quando alguém precisar tocar naquele client.

> ### app-busca-search

> ### https://services.staging.app.dados.rio/app-busca-search/swagger/index.html#/

* https://raw.githubusercontent.com/prefeitura-rio/app-busca-search/refs/heads/staging/docs/openapi-v3.json

```
 api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-busca-search/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http-busca-search/api.ts',
      schemas: './src/http-busca-search/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_APP_BUSCA_SEARCH,
      override: {
        mutator: {
          path: './custom-fetch-busca-search.ts',
          name: 'customFetchBuscaSearch',
        },
      },
    },
  },
```

> ### app-go-api

* https://raw.githubusercontent.com/prefeitura-rio/app-go-api/refs/heads/staging/docs/openapi-v3.json

```
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-go-api/refs/heads/main/docs/swagger.yaml',
    output: {
      target: './src/http-courses/api.ts',
      schemas: './src/http-courses/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.COURSES_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-course.ts',
          name: 'customFetch',
        },
      },
    },
  },

```

> ## API HEIMDALL

- https://raw.githubusercontent.com/prefeitura-rio/heimdall/refs/heads/main/docs/api/openapi.json

```
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/heimdall/refs/heads/main/docs/api/openapi.json',
    output: {
      target: './src/http-heimdall/api.ts',
      schemas: './src/http-heimdall/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_HEIMDALL_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-heimdall.ts',
          name: 'customFetchHeimdall',
        },
      },
    },
  },
```

> ## API RMI

- https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/main/docs/swagger.json

```
 api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/main/docs/swagger.json',
    output: {
      target: './src/http/api.ts',
      schemas: './src/http/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_RMI_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
```

> ## API Agent (Curriculo)

* https://raw.githubusercontent.com/prefeitura-rio/superapp-agent-api/refs/heads/main/openapi.yaml

```
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/superapp-agent-api/refs/heads/main/openapi.yaml',
    output: {
      target: './src/http-agent-api/api.ts',
      schemas: './src/http-agent-api/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.AGENT_API_BASE_URL,
      override: {
        mutator: {
          path: './custom-fetch-agent-api.ts',
          name: 'customFetchAgentApi',
        },
      },
    },
  },
```

> ## API Pref.Rio — Carta de Serviços (MuleSoft)

* Spec local: `./pref-rio-carta-servicos-api.yaml` (raiz do repo)

```
  api: {
    input: './pref-rio-carta-servicos-api.yaml',
    output: {
      target: './src/http-pref-rio-carta-servicos/api.ts',
      schemas: './src/http-pref-rio-carta-servicos/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CARTA_SERVICOS,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-carta-servicos.ts',
          name: 'customFetchPrefRioCartaServicos',
        },
      },
    },
  },
```

> ## API Pref.Rio — Cidadão (MuleSoft)

* Spec local: `./pref-rio-cidadao-api.yaml` (raiz do repo)

```
  api: {
    input: './pref-rio-cidadao-api.yaml',
    output: {
      target: './src/http-pref-rio-cidadao/api.ts',
      schemas: './src/http-pref-rio-cidadao/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CIDADAO,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-cidadao.ts',
          name: 'customFetchPrefRioCidadao',
        },
      },
    },
  },
```

> ## API Pref.Rio — Chamados Público (MuleSoft)

* Spec local: `./pref-rio-chamados-publico-api.yaml` (raiz do repo)

```
  api: {
    input: './pref-rio-chamados-publico-api.yaml',
    output: {
      target: './src/http-pref-rio-chamados-publico/api.ts',
      schemas: './src/http-pref-rio-chamados-publico/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-chamados-publico.ts',
          name: 'customFetchPrefRioChamadosPublico',
        },
      },
    },
  },
```

> ## API Dívida Ativa Imobiliária (contrato provisório)

* Spec local: `./divida-ativa-api.yaml` (raiz do repo)
* Documentação do módulo: [`divida-ativa.md`](./divida-ativa.md)

> **Projeto `dividaAtiva`** — regenerar com `npx orval --project dividaAtiva`.
>
> Contrato **real** (`api-imoveis`, Quarkus), cópia fiel do documento servido pela instância
> de homologação em `https://api-appimoveishom.apps.ocp.rio.gov.br/swagger`. Substituiu o
> contrato provisório em 17/08/2026 (colhido então da máquina do dev, em
> `http://10.5.225.173:8080/swagger`) e foi atualizado a partir de homologação em 31/08/2026.
> Não editar o arquivo à mão — ele é de outra equipe; para atualizar, **copie o spec de novo**.
>
> O `input` aponta para o arquivo local, não para a URL, de propósito: `/swagger` é endpoint de
> runtime, não spec versionado. Ler dele faria a geração do client depender de a homologação
> estar no ar e de rede interna, e uma mudança de contrato entraria sem aparecer no diff do PR.
>
> Cuidados conhecidos do spec: 25 das 32 operações não declaram schema de resposta (o Orval
> gera `data: void`), nenhuma tem `operationId` (os nomes das funções saem do path),
> `GET /imoveis` está tipado como objeto singular quando devolve array, e
> `GET /imoveis/{inscricao}/cadastro` declara um objeto no schema mas a descrição fala em
> "lista vazia" — as duas formas são absorvidas por `normalizarConsultaFazenda`.

```
  api: {
    input: './divida-ativa-api.yaml',
    output: {
      target: './src/http-divida-ativa/api.ts',
      schemas: './src/http-divida-ativa/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_DIVIDA_ATIVA,
      override: {
        mutator: {
          path: './custom-fetch-divida-ativa.ts',
          name: 'customFetchDividaAtiva',
        },
      },
    },
  },
```

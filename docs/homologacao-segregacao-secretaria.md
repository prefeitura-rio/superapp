# Roteiro de Homologação — Segregação de Acesso por Secretaria

Feature: segregação dos artefatos (cursos e vagas de emprego) por secretaria, com base no mapeamento CPF → `cd_ua` via RMI.

---

## Perfis de Usuário

| #            | Perfil                                 | Role JWT                 | Role Heimdall        | Secretaria (RMI) | CPF          |
| ------------ | -------------------------------------- | ------------------------ | -------------------- | ---------------- | ------------ |
| **U1** | Admin no JWT, sem secretaria           | `admin` (realm_access) | —                   | Não mapeada     | `[CPF_U1]` |
| **U2** | Admin no Heimdall, sem secretaria      | —                       | `go:admin`         | Não mapeada     | `[CPF_U2]` |
| **U3** | Admin (JWT + Heimdall), com secretaria | `admin`                | `go:admin`         | Secretaria A     | `[CPF_U3]` |
| **U4** | Operador Heimdall, com secretaria      | —                       | `go:cursos:editor` | Secretaria B     | `[CPF_U4]` |
| **U5** | Sem role, com secretaria               | —                       | —                   | Secretaria A     | `[CPF_U5]` |
| **U6** | Cidadão comum                         | —                       | —                   | Não mapeada     | `[CPF_U6]` |

> **Importante:** O portal-interno resolve roles exclusivamente via Heimdall (`GET /api/v1/users/me`). Roles presentes apenas no JWT (U1) não são reconhecidas pelo backoffice nem pela API.

---

## Dados de Teste Necessários

**Secretarias:**

| #            | Nome                     | cd_ua       |
| ------------ | ------------------------ | ----------- |
| Secretaria A | (ex.: SMS – Saúde)     | `[CUA_A]` |
| Secretaria B | (ex.: SME – Educação) | `[CUA_B]` |

**Cursos:**

| ID       | Pertence     | Status    |
| -------- | ------------ | --------- |
| Curso-A1 | Secretaria A | Publicado |
| Curso-A2 | Secretaria A | Rascunho  |
| Curso-B1 | Secretaria B | Publicado |
| Curso-B2 | Secretaria B | Rascunho  |

**Vagas de Emprego:**

| ID      | Pertence     | Status    |
| ------- | ------------ | --------- |
| Vaga-A1 | Secretaria A | Publicada |
| Vaga-B1 | Secretaria B | Publicada |

**Mapeamentos RMI a criar antes do teste:**

```
POST /v1/admin/cpf-secretaria/[CPF_U3]  { "cd_ua": "[CUA_A]" }
POST /v1/admin/cpf-secretaria/[CPF_U4]  { "cd_ua": "[CUA_B]" }
POST /v1/admin/cpf-secretaria/[CPF_U5]  { "cd_ua": "[CUA_A]" }
```

**Inscrições preexistentes para validação:**

- U6 inscrito no Curso-A1
- U3 inscrito no Curso-B1 (feita pelo superapp)

---

## 1. Superapp — Oportunidades Cariocas (Portal Público)

### 1.1 Cursos — Deslogado

| ID      | Cenário                                           | Resultado Esperado                                           |
| ------- | -------------------------------------------------- | ------------------------------------------------------------ |
| S-CD-01 | Acessar listagem de cursos sem login               | Curso-A1 e Curso-B1 visíveis (todos publicados, sem filtro) |
| S-CD-02 | Acessar detalhe do Curso-A1 sem login              | Detalhes completos exibidos                                  |
| S-CD-03 | Acessar detalhe do Curso-B1 sem login              | Detalhes completos exibidos                                  |
| S-CD-04 | Rascunhos (A2, B2) não devem aparecer na listagem | Ausentes da listagem                                         |

### 1.2 Cursos — Logado (listagem)

Todos os 6 usuários devem ver **todos os cursos publicados**, independente de secretaria. O superapp usa `/api/public/courses` (sem middleware de filtro).

| ID      | Usuário | Resultado Esperado            |
| ------- | -------- | ----------------------------- |
| S-CL-01 | U1       | Curso-A1 e Curso-B1 visíveis |
| S-CL-02 | U2       | Curso-A1 e Curso-B1 visíveis |
| S-CL-03 | U3       | Curso-A1 e Curso-B1 visíveis |
| S-CL-04 | U4       | Curso-A1 e Curso-B1 visíveis |
| S-CL-05 | U5       | Curso-A1 e Curso-B1 visíveis |
| S-CL-06 | U6       | Curso-A1 e Curso-B1 visíveis |

### 1.3 Cursos — Inscrições

| ID      | Usuário | Cenário                                                        | Resultado Esperado                                             |
| ------- | -------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| S-CI-01 | Todos    | Ver próprias inscrições                                      | Cada usuário vê apenas as suas próprias                     |
| S-CI-02 | U6       | Inscrever-se no Curso-A1 (Secretaria A)                         | Inscrição realizada com sucesso                              |
| S-CI-03 | U6       | Inscrever-se no Curso-B1 (Secretaria B)                         | Inscrição realizada com sucesso                              |
| S-CI-04 | U3       | Inscrever-se no Curso-B1 (secretaria diferente da sua)          | **Sucesso** — superapp não aplica filtro de secretaria |
| S-CI-05 | U5       | Inscrever-se no Curso-B1 (secretaria diferente da sua)          | **Sucesso** — superapp não aplica filtro de secretaria |
| S-CI-06 | U3       | Ver na listagem de inscrições a inscrição feita no Curso-B1 | Aparece normalmente                                            |

### 1.4 Vagas de Emprego — Deslogado

| ID      | Cenário                             | Resultado Esperado          |
| ------- | ------------------------------------ | --------------------------- |
| S-VD-01 | Listar vagas sem login               | Vaga-A1 e Vaga-B1 visíveis |
| S-VD-02 | Acessar detalhe da Vaga-A1 sem login | Detalhes completos exibidos |

### 1.5 Vagas de Emprego — Logado

| ID      | Usuário       | Resultado Esperado          |
| ------- | -------------- | --------------------------- |
| S-VL-01 | Todos (U1–U6) | Vaga-A1 e Vaga-B1 visíveis |

---

## 2. Portal-Interno — Backoffice

### 2.1 Acesso ao Portal

| ID      | Usuário | Resultado Esperado                                    | Observação                             |
| ------- | -------- | ----------------------------------------------------- | ---------------------------------------- |
| P-AC-01 | U1       | **Acesso negado** → redirect `/unauthorized` | JWT admin não reconhecido pelo Heimdall |
| P-AC-02 | U2       | Acesso concedido                                      | `go:admin` no Heimdall                 |
| P-AC-03 | U3       | Acesso concedido                                      | `go:admin` no Heimdall                 |
| P-AC-04 | U4       | Acesso concedido (somente seção de Cursos)          | `go:cursos:editor` no Heimdall         |
| P-AC-05 | U5       | **Acesso negado** → redirect `/unauthorized` | Sem role no Heimdall                     |
| P-AC-06 | U6       | **Acesso negado** → redirect `/unauthorized` | Cidadão comum                           |

### 2.2 Cursos — Listagem

| ID      | Usuário | Resultado Esperado                         | Observação                                                                  |
| ------- | -------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| P-CL-01 | U2       | **Todos** os cursos (A1, A2, B1, B2) | `go:admin` bypassa filtro de secretaria                                     |
| P-CL-02 | U3       | ⚠️ Verificar: todos ou apenas Sec. A?    | `go:admin` bypassa filtro mesmo com secretaria mapeada — ver nota ao final |
| P-CL-03 | U4       | Apenas Curso-B1 e Curso-B2                 | Secretaria B mapeada, filtro aplicado                                         |
| P-CL-04 | U1       | 403 ou lista vazia                         | Sem`IsAdmin` na API, sem secretaria                                         |

### 2.3 Cursos — Criação

| ID      | Usuário | Cenário                             | Resultado Esperado                                                         |
| ------- | -------- | ------------------------------------ | -------------------------------------------------------------------------- |
| P-CC-01 | U2       | Criar curso para Secretaria A        | Sucesso (`go:admin` sem restrição de orgão)                           |
| P-CC-02 | U2       | Criar curso para Secretaria B        | Sucesso                                                                    |
| P-CC-03 | U3       | Criar curso para Secretaria A        | ⚠️ Verificar: sucesso (admin bypassa) ou bloqueado pelo orgão injetado? |
| P-CC-04 | U4       | Criar curso para Secretaria B        | Sucesso — orgão da Sec. B é injetado automaticamente                    |
| P-CC-05 | U4       | Tentar criar curso para Secretaria A | **403** — orgão não pertence à sua secretaria                    |

### 2.4 Cursos — Edição e Exclusão

| ID      | Usuário | Cenário                                   | Resultado Esperado                                        |
| ------- | -------- | ------------------------------------------ | --------------------------------------------------------- |
| P-CE-01 | U2       | Editar Curso-A1 (Secretaria A)             | Sucesso                                                   |
| P-CE-02 | U2       | Editar Curso-B1 (Secretaria B)             | Sucesso                                                   |
| P-CE-03 | U4       | Editar Curso-B1 (sua secretaria)           | Sucesso                                                   |
| P-CE-04 | U4       | Tentar editar Curso-A1 (outra secretaria)  | **403** `"curso não pertence à sua secretaria"` |
| P-CE-05 | U4       | Tentar excluir Curso-A1 (outra secretaria) | **403** `"curso não pertence à sua secretaria"` |
| P-CE-06 | U2       | Excluir Curso-B2 (rascunho, Secretaria B)  | Sucesso                                                   |

### 2.5 Cursos — Gestão de Inscrições

| ID      | Usuário | Cenário                                                      | Resultado Esperado                                                                          |
| ------- | -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| P-CI-01 | U2       | Ver inscrições do Curso-A1                                  | Todas visíveis (`go:admin`)                                                              |
| P-CI-02 | U2       | Ver inscrições do Curso-B1                                  | Todas visíveis                                                                             |
| P-CI-03 | U4       | Ver inscrições do Curso-B1 (sua secretaria)                 | Visíveis                                                                                   |
| P-CI-04 | U4       | Tentar ver inscrições do Curso-A1                           | **403** ou resultado vazio                                                            |
| P-CI-05 | U4       | Verificar inscrição de U3 (feita pelo superapp) no Curso-B1 | Aparece — inscrições via superapp refletem no portal-interno da secretaria dona do curso |

### 2.6 Vagas de Emprego — Listagem

| ID      | Usuário | Resultado Esperado                          | Observação                                                                                         |
| ------- | -------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P-VL-01 | U2       | Vaga-A1 e Vaga-B1 visíveis                 | `go:admin` bypassa filtro                                                                          |
| P-VL-02 | U4       | ⚠️ Verificar se acessa a seção de vagas | `go:cursos:editor` não cobre empregabilidade — verificar se portal bloqueia ou exibe lista vazia |

> Para testar vagas com role específica, criar **U7** com `go:empregabilidade:editor_com_curadoria` + Secretaria B.

### 2.7 Vagas de Emprego — Criação, Edição e Exclusão

> Usar U7 (`go:empregabilidade:editor_com_curadoria` + Secretaria B) nos casos abaixo.

| ID      | Usuário | Cenário                                 | Resultado Esperado                   |
| ------- | -------- | ---------------------------------------- | ------------------------------------ |
| P-VC-01 | U2       | Criar vaga para Secretaria A             | Sucesso                              |
| P-VC-02 | U7       | Criar vaga para Secretaria B             | Sucesso — orgão da Sec. B injetado |
| P-VC-03 | U7       | Tentar criar vaga para Secretaria A      | **403**                        |
| P-VC-04 | U7       | Editar Vaga-B1 (sua secretaria)          | Sucesso                              |
| P-VC-05 | U7       | Tentar editar Vaga-A1 (outra secretaria) | **403**                        |

### 2.8 Candidaturas (Empregabilidade)

| ID      | Usuário | Cenário                                     | Resultado Esperado       |
| ------- | -------- | -------------------------------------------- | ------------------------ |
| P-CA-01 | U2       | Ver candidaturas da Vaga-A1                  | Visíveis (`go:admin`) |
| P-CA-02 | U2       | Ver candidaturas da Vaga-B1                  | Visíveis                |
| P-CA-03 | U7       | Ver candidaturas da Vaga-B1 (sua secretaria) | Visíveis                |
| P-CA-04 | U7       | Tentar ver candidaturas da Vaga-A1           | **403** ou vazio   |

---

## 3. Cenários de Borda

| ID   | Cenário                                                                  | Resultado Esperado                                                                                                   |
| ---- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| B-01 | Remover mapeamento RMI de U4 durante sessão ativa e tentar listar cursos | Lista vazia (cache do token pode mascarar por alguns segundos)                                                       |
| B-02 | U4 com`cd_ua` mapeado que não existe na tabela `orgao_snapshots`     | Lista vazia e bloqueio em escrita —`cd_ua` precisa estar sincronizado via `OrgaoSyncWorker`                     |
| B-03 | app-rmi indisponível durante request autenticada de U4 no portal-interno | Fail-closed: API retorna 403 / lista vazia — nenhum dado de outra secretaria é exposto                             |
| B-04 | Tentar adicionar mapeamento duplicado U3 → Secretaria A via POST no RMI  | **409 Conflict** `"already exists"`                                                                          |
| B-05 | U4 chama`/api/v1/courses` diretamente via curl (bypassando o portal)    | Filtro de Secretaria B aplicado normalmente — filtro está na API, não apenas no frontend                          |
| B-06 | U3 (admin + secretaria A) lista cursos no portal-interno                  | ⚠️`go:admin` bypassa filtro — U3 vê todos os cursos. Confirmar se este comportamento é esperado pelo negócio |

---

## Pontos de Atenção

1. **U3 (admin + secretaria):** A implementação faz o check de `IsAdmin` antes do check de secretaria. Um usuário com `go:admin` + secretaria mapeada vê **todos** os artefatos, não apenas os da sua secretaria. Verificar se o requisito de negócio aceita isso ou se admin com secretaria deve ser restrito à sua secretaria.
2. **`editor_com_curadoria` sem secretaria:** Esse role só funciona via path de secretaria (RMI). Sem mapeamento no RMI o usuário recebe 403. Diferente de `go:cursos:editor`, que tem fallback via grupo `go:orgao:{id}` no Heimdall.
3. **Sincronização `OrgaoSyncWorker`:** O `cd_ua` retornado pelo RMI precisa existir na tabela `orgao_snapshots`. Se o worker não sincronizou o órgão, o usuário fica efetivamente bloqueado mesmo com mapeamento válido no RMI (ver cenário B-02).

# Migração: Status de Cursos via Backend

## Contexto

Anteriormente, o frontend calculava dinamicamente o estado de cursos com base em datas (`enrollment_start_date`, `enrollment_end_date`, `class_end_date`). Com a evolução da API, o backend passou a retornar o campo `status` já computado, tornando essa lógica de datas no cliente redundante e sujeita a inconsistências.

## Novos status retornados pela API

| Status                  | Descrição                                                                 |
|-------------------------|---------------------------------------------------------------------------|
| `draft`                 | Em elaboração, não publicado                                              |
| `in_review`             | Submetido para revisão                                                    |
| `needs_changes`         | Curadoria solicitou alterações                                            |
| `published`             | Publicado (base para os status dinâmicos)                                 |
| `pending_deletion`      | Exclusão pendente                                                         |
| `scheduled`             | Publicado, mas inscrições ainda não abertas                               |
| `accepting_enrollments` | Dentro do período de inscrição                                            |
| `in_progress`           | Período de aulas em andamento                                             |
| `finished`              | Período de aulas encerrado                                                |
| `closed`                | Encerrado manualmente pelo gestor                                         |
| `canceled`              | Cancelado                                                                 |

## O que mudou

### Arquivo: `src/lib/course-utils.ts`

#### `shouldShowCourse`

Substituída a lógica de `status !== 'opened'` + verificações de 30 dias por dois conjuntos de status:

- **`LISTING_STATUSES`** (visível na listagem `/servicos/cursos`):
  `opened`, `published`, `scheduled`, `accepting_enrollments`, `in_progress`

- **`URL_STATUSES`** (acessível via URL direta `/servicos/cursos/[slug]`):
  tudo acima + `finished`, `closed`, `canceled`

Qualquer outro status (`draft`, `needs_changes`, `in_review`, `pending_deletion`) resulta em `notFound`.

A verificação de `is_visible` foi mantida para a listagem (cursos com `is_visible: false` não aparecem na home, mas ainda são acessíveis via URL direta).

#### `getCourseEnrollmentInfo`

Adicionados retornos antecipados baseados no status do backend, que têm prioridade sobre as verificações de datas:

1. **`finished` / `closed` / `canceled`** → botão desabilitado com texto "Curso não está mais disponível" (`status: 'not_available'`). Usuários que já concluíram o curso ainda veem o botão de certificado (checado antes desta lógica).

2. **`scheduled`** → botão desabilitado com "Disponível em breve" (`status: 'coming_soon'`), sem checar datas.

3. **`accepting_enrollments`** → pula completamente as verificações de datas (`class_end_date`, `enrollment_start_date`, `enrollment_end_date`) e vai direto para a checagem de vagas. Isso corrige o bug onde um curso com `class_end_date` no passado (turma já encerrada, mas novo período aberto) ficava com o botão desabilitado mesmo com o backend indicando inscrições abertas.

Para os demais status (`opened`, `published`, `in_progress`), as verificações de datas permanecem como fallback.

### Arquivo: `src/lib/__tests__/course-utils.test.ts`

- Testes de `shouldShowCourse` reescritos para cobrir os novos conjuntos de status (sem dependência de datas).
- Testes de `filterVisibleCourses` atualizados para validar os 5 status de listagem e a exclusão dos demais.
- Novos testes em `getCourseEnrollmentInfo`:
  - `accepting_enrollments` com `class_end_date` no passado → deve retornar `available`.
  - `scheduled` → deve retornar `coming_soon`.
  - `finished`/`closed`/`canceled` → deve retornar `not_available`.
  - Usuário que concluiu curso com status `finished` → ainda vê o certificado.

## Comportamento na interface

| Situação                                           | Resultado                                      |
|----------------------------------------------------|------------------------------------------------|
| Curso `published`, `scheduled`, `accepting_enrollments`, `in_progress` | Aparece na listagem e detalhe normais |
| Curso `finished`, `closed`, `canceled`             | Não aparece na listagem; acessível via URL com botão desabilitado ("Curso não está mais disponível") |
| Curso `draft`, `needs_changes`, `in_review`, `pending_deletion` | Página 404 (notFound)               |
| Usuário que concluiu curso encerrado com certificado | Botão "Acessar certificado" habilitado        |

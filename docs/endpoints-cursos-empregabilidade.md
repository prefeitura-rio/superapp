# Endpoints de Cursos e Empregabilidade — app-go-api

Mapeamento dos endpoints da `app-go-api` efetivamente utilizados no **superapp** e no **portal-interno**, gerados via Orval.

| ✓ = utilizado | — = não utilizado |

---

## Cursos

| Endpoint | superapp | portal-interno |
|----------|:--------:|:--------------:|
| GET `/api/public/courses` | ✓ | — |
| GET `/api/public/courses/{courseId}` | ✓ | — |
| GET `/api/v1/courses` | — | — |
| POST `/api/v1/courses/draft` | — | ✓ |
| GET `/api/v1/courses/drafts` | — | ✓ |
| GET `/api/v1/courses/{courseId}` | — | ✓ |
| PUT `/api/v1/courses/{courseId}` | — | ✓ |
| DELETE `/api/v1/courses/{courseId}` | — | ✓ |
| GET `/api/v1/courses/{courseId}/enrollments` | ✓ | ✓ |
| POST `/api/v1/courses/{courseId}/enrollments` | ✓ | — |
| DELETE `/api/v1/courses/{courseId}/enrollments/{enrollmentId}` | ✓ | — |
| POST `/api/v1/courses/{courseId}/enrollments/import` | — | ✓ |
| POST `/api/v1/courses/{courseId}/enrollments/manual` | — | ✓ |
| PUT `/api/v1/courses/{courseId}/enrollments/status` | — | ✓ |
| PUT `/api/v1/courses/{courseId}/enrollments/{enrollmentId}/certificate` | — | ✓ |
| PUT `/api/v1/courses/{courseId}/enrollments/{enrollmentId}/status` | — | ✓ |
| PUT `/api/v1/enrollments/{enrollmentId}/schedule` | ✓ | — |
| GET `/api/v1/enrollments/user/{cpf}` | ✓ | — |
| GET `/api/v1/categorias` | ✓ | — |
| GET `/api/v1/jobs/{jobId}/status` | — | ✓ |

---

## Empregabilidade — Vagas

| Endpoint | superapp | portal-interno |
|----------|:--------:|:--------------:|
| GET `/api/public/empregabilidade/vagas` | ✓ | — |
| GET `/api/public/empregabilidade/vagas/{id}` | ✓ | — |
| GET `/api/v1/empregabilidade/vagas` | ✓ | ✓ |
| POST `/api/v1/empregabilidade/vagas` | — | ✓ |
| GET `/api/v1/empregabilidade/vagas/{id}` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}` | — | ✓ |
| DELETE `/api/v1/empregabilidade/vagas/{id}` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}/publish` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}/send-to-approval` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}/send-to-draft` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}/freeze` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}/unfreeze` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}/discontinue` | — | ✓ |
| PUT `/api/v1/empregabilidade/vagas/{id}/reactivate` | — | ✓ |

---

## Empregabilidade — Candidaturas

| Endpoint | superapp | portal-interno |
|----------|:--------:|:--------------:|
| GET `/api/v1/empregabilidade/candidaturas` | — | ✓ |
| POST `/api/v1/empregabilidade/candidaturas` | ✓ | ✓ |
| GET `/api/v1/empregabilidade/candidaturas/usuario/{cpf}` | ✓ | — |
| PUT `/api/v1/empregabilidade/candidaturas/bulk-etapa` | — | ✓ |
| PUT `/api/v1/empregabilidade/candidaturas/bulk-status` | — | ✓ |
| PUT `/api/v1/empregabilidade/candidaturas/{id}/approve` | — | ✓ |
| PUT `/api/v1/empregabilidade/candidaturas/{id}/reject` | — | ✓ |
| PUT `/api/v1/empregabilidade/candidaturas/{id}/etapa` | — | ✓ |
| PUT `/api/v1/empregabilidade/candidaturas/{id}/status` | — | ✓ |

---

## Empregabilidade — Currículo

> Exclusivo do superapp — o cidadão gerencia o próprio currículo.

| Endpoint | superapp | portal-interno |
|----------|:--------:|:--------------:|
| GET `/api/v1/empregabilidade/curriculo/{cpf}` | ✓ | — |
| GET `/api/v1/empregabilidade/curriculo/{cpf}/conquistas` | ✓ | — |
| GET `/api/v1/empregabilidade/curriculo/{cpf}/experiencias` | ✓ | — |
| PUT `/api/v1/empregabilidade/curriculo/{cpf}/experiencias` | ✓ | — |
| GET `/api/v1/empregabilidade/curriculo/{cpf}/formacoes` | ✓ | — |
| PUT `/api/v1/empregabilidade/curriculo/{cpf}/formacoes` | ✓ | — |
| GET `/api/v1/empregabilidade/curriculo/{cpf}/idiomas` | ✓ | — |
| GET `/api/v1/empregabilidade/curriculo/{cpf}/situacao-interesses` | ✓ | — |
| PUT `/api/v1/empregabilidade/curriculo/situacao-interesses` | ✓ | — |

---

## Empregabilidade — Onboarding e Termos de Uso

> Exclusivo do superapp.

| Endpoint | superapp | portal-interno |
|----------|:--------:|:--------------:|
| GET `/api/v1/empregabilidade/onboarding/{cpf}` | ✓ | — |
| PUT `/api/v1/empregabilidade/onboarding/{cpf}/complete` | ✓ | — |
| GET `/api/v1/empregabilidade/termos-uso/{cpf}` | ✓ | — |
| PUT `/api/v1/empregabilidade/termos-uso/{cpf}/accept` | ✓ | — |

---

## Empregabilidade — Empresas e Lookups

> Exclusivo do superapp.

| Endpoint | superapp | portal-interno |
|----------|:--------:|:--------------:|
| GET `/api/v1/empregabilidade/empresas` | ✓ | — |
| GET `/api/v1/empregabilidade/empresas/{cnpj}` | ✓ | — |
| GET `/api/v1/empregabilidade/escolaridades` | ✓ | — |
| GET `/api/v1/empregabilidade/idiomas` | ✓ | — |
| GET `/api/v1/empregabilidade/niveis-idioma` | ✓ | — |
| GET `/api/v1/empregabilidade/disponibilidades` | ✓ | — |
| GET `/api/v1/empregabilidade/regimes-contratacao` | ✓ | — |
| GET `/api/v1/empregabilidade/situacoes-atual` | ✓ | — |
| GET `/api/v1/empregabilidade/tipos-conquista` | ✓ | — |
| GET `/api/v1/empregabilidade/modelos-trabalho` | ✓ | — |

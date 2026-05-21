# Migração de dados autenticados de cursos para TanStack Query

## Problema

A página de cursos usava RSC com `dynamic = 'force-dynamic'` para buscar todos os dados, incluindo enrollments do usuário. O Google Cloud CDN às vezes cacheava as respostas do servidor por URL, sem considerar cookies de sessão — fazendo com que usuários autenticados vissem estado de "não logado" (sem seção "Meus cursos", botão "Inscreva-se" em vez do status real da inscrição).

**Raiz:** O CDN não diferencia requisições autenticadas de não-autenticadas quando a URL é a mesma. Dados de enrollment vazavam entre usuários ou chegavam incorretos.

---

## Solução

Separar os dados em duas categorias:

| Tipo | Estratégia | Motivo |
|---|---|---|
| Lista de cursos, categorias, detalhes do curso | RSC + Next.js cache (DAL) | Públicos, iguais para todos, beneficiam SEO |
| Enrollments, status de inscrição | TanStack Query (client side) | Específicos por usuário, nunca devem ser cacheados pelo CDN |

---

## Arquivos criados

### API Routes

**`src/app/api/user/cursos/inscricoes/route.ts`**
- `GET /api/user/cursos/inscricoes`
- Lê o cookie `access_token`, extrai o CPF, busca todos os enrollments do usuário
- Retorna `{ enrollments: [...] }`
- Header `Cache-Control: private, no-cache, no-store` garante que o CDN nunca armazene a resposta

**`src/app/api/user/cursos/inscricoes/[courseId]/route.ts`**
- `GET /api/user/cursos/inscricoes/:courseId`
- Busca o enrollment do usuário para um curso específico
- Retorna `{ enrollment: {...} | null }`
- Mesmo header de no-cache

### Hooks TanStack Query

**`src/hooks/courses/use-user-enrollments.ts`**
```ts
useUserEnrollments()
// queryKey: ['user-enrollments']
// staleTime: 5 min
```

**`src/hooks/courses/use-user-enrollment.ts`**
```ts
useUserEnrollment(courseId: number | undefined)
// queryKey: ['user-enrollment', courseId]
// staleTime: 5 min
// enabled: apenas quando courseId estiver definido
```

### Client components criados

**`src/app/(app)/.../cursos/meus-cursos/components/my-courses-content.tsx`**
- Exibe a lista de "Meus cursos" usando `useUserEnrollments()`
- Inclui skeleton de loading enquanto aguarda a resposta

**`src/app/(app)/.../cursos/certificados/components/certificates-content.tsx`**
- Exibe a lista de certificados usando `useUserEnrollments()`
- Filtra por `status === 'concluded' | 'approved'` e `has_certificate === true` via `useMemo`
- Recebe `studentName` como prop (lido do JWT no RSC — não precisa de API route própria)
- Inclui skeleton de loading e estado vazio ("Você ainda não possui nenhum certificado")
- Reutiliza o cache `['user-enrollments']` — se o usuário já passou pela página principal, nenhuma requisição extra é feita

---

## Arquivos modificados

### RSC — dados autenticados removidos

**`src/app/(app)/.../cursos/page.tsx`**
- Removido: fetch de enrollments do usuário (`getApiV1EnrollmentsUserCpf`)
- Removido: `getUserInfoFromToken()` (não é mais necessário aqui)
- Removido: `dynamic = 'force-dynamic'` (a página pode ser cacheada normalmente pelo CDN, pois só tem dados públicos)
- Mantido: busca de cursos e categorias via DAL

**`src/app/(app)/.../cursos/[slug]/page.tsx`**
- Removido: `getUserEnrollment()` (server action que buscava o enrollment no RSC)
- Removido: `getUserInfoFromToken()`
- Mantido: busca do curso e dados do departamento (SEO intacto — título, descrição, organização estão no HTML inicial)

**`src/app/(app)/.../cursos/meus-cursos/page.tsx`**
- Removido: fetch de enrollments (`getApiV1EnrollmentsUserCpf`)
- Mantido: verificação de autenticação e redirect (lê cookie no servidor, seguro)
- Adicionado: renderiza `<MyCoursesContent />` (client component)

**`src/app/(app)/.../cursos/certificados/page.tsx`**
- Removido: fetch de enrollments (`getApiV1EnrollmentsUserCpf`) e toda a lógica de filtragem
- Mantido: verificação de autenticação e redirect; leitura de `userInfo.name` do JWT (passado como prop)
- Adicionado: renderiza `<CertificatesContent studentName={...} autoOpenCourseId={...} />`

### Client components — TanStack Query adicionado

**`src/app/components/courses/courses-client.tsx`**
- Removido: prop `myCourses` (não vem mais do servidor)
- Adicionado: `useUserEnrollments()` para buscar enrollments no client
- Adicionado: skeleton (`RecentlyAddedCoursesSwipeSkeleton`) enquanto enrollments carregam
- A transformação de `enrollments → ModelsCurso[]` é feita no client via `useMemo`

**`src/app/components/courses/course-details.tsx`**
- Removido: props `userEnrollment` e `userInfo` (não vêm mais do servidor)
- Adicionado: `useUserEnrollment(course.id)` para buscar enrollment no client
- Adicionado: skeleton no botão de ação enquanto enrollment carrega
- Adicionado: `queryClient.invalidateQueries` após cancelar inscrição:
  ```ts
  await queryClient.invalidateQueries({ queryKey: ['user-enrollments'] })
  await queryClient.invalidateQueries({ queryKey: ['user-enrollment', course.id] })
  ```

**`src/app/(app)/.../cursos/confirmar-informacoes/components/confirm-inscription-client.tsx`**
- Adicionado: `useQueryClient()` e invalidação de cache após inscrição bem-sucedida:
  ```ts
  await queryClient.invalidateQueries({ queryKey: ['user-enrollments'] })
  await queryClient.invalidateQueries({ queryKey: ['user-enrollment', Number.parseInt(courseId)] })
  ```
- Garante que ao voltar para a página do curso, o status já está atualizado

---

## Query keys

```
['user-enrollments']           → lista de todos os enrollments do usuário
['user-enrollment', courseId]  → enrollment em um curso específico (courseId: number)
```

---

## Fluxo de invalidação de cache

```
Usuário se inscreve (confirm-inscription-client)
  → submitCourseInscription() [server action]
  → queryClient.invalidateQueries(['user-enrollments'])
  → queryClient.invalidateQueries(['user-enrollment', courseId])
  → próxima visita à página do curso já mostra status atualizado

Usuário cancela inscrição (course-details)
  → deleteEnrollment() [server action]
  → queryClient.invalidateQueries(['user-enrollments'])
  → queryClient.invalidateQueries(['user-enrollment', courseId])
  → botão volta para "Inscreva-se" imediatamente
```

---

## SEO

| Página | Conteúdo no HTML inicial | Observação |
|---|---|---|
| `/servicos/cursos` | Lista de cursos, categorias | ✅ SEO preservado |
| `/servicos/cursos/[id]` | Título, descrição, organização, datas | ✅ SEO preservado |
| `/servicos/cursos/meus-cursos` | Apenas estrutura da página | ✅ Sem valor de SEO — client side adequado |
| `/servicos/cursos/certificados` | Apenas estrutura da página | ✅ Sem valor de SEO — client side adequado |

---

## Verificação

1. Acessar `/servicos/cursos` sem login → lista aparece no HTML, sem seção "Meus cursos"
2. Logar e acessar `/servicos/cursos` → "Meus cursos" aparece após load do TanStack Query
3. Se inscrever → ao voltar para a lista, "Meus cursos" já está atualizado
4. Cancelar inscrição na página do curso → botão volta para "Inscreva-se" sem recarregar
5. Acessar `/servicos/cursos/certificados` após já ter visitado a página principal → nenhuma requisição extra para `/api/user/cursos/inscricoes` (cache `['user-enrollments']` já populado)
6. No DevTools → Network: chamadas para `/api/user/cursos/inscricoes` têm `Cache-Control: private, no-store`
7. No DevTools → Network: a página `/servicos/cursos` não tem `Set-Cookie` ou dados de usuário no payload HTML

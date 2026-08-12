# CadMicro — Integração API (Orval + mocks + Query + Actions)

## Arquitetura

| Camada | Papel |
|--------|--------|
| `src/http/mobilidade/` | Clients Orval (app-rmi) |
| `src/lib/cadmicro/*-service.ts` | Gate mock vs API + mappers UI |
| `src/app/api/cadmicro/{vehicles,invitations,catalog}/*` | BFF GET (cookies → Bearer) |
| `src/hooks/cadmicro/*` | TanStack Query + invalidação |
| `src/actions/cadmicro/*` | Mutations (Server Actions) + `revalidatePath` |

Upload GCS continua em `/api/cadmicro/files/*` (sem mudança).

## Flag de mocks

`NEXT_PUBLIC_CADMICRO_USE_MOCKS`:

- **unset ou qualquer valor ≠ `false`** → GETs retornam fixtures; mutations short-circuit com `{ success: true }` (fluxo de UI testável sem API).
- **`false`** → Orval real via `BASE_API_URL_RMI`.

Gate único: [`src/lib/cadmicro/mocks-gate.ts`](../src/lib/cadmicro/mocks-gate.ts).

Com mocks OFF, falha de GET **não** cai em fixture no client: a UI dispara toast de erro; no catálogo (marcas/modelos/cores) o bottomsheet mostra “Não foi possível carregar…”.

## Cache após mutation

1. **Server Action** chama `revalidatePath('/carteira')` e paths do veículo.
2. **Client** chama `useInvalidateCadmicroQueries()` (keys em `src/lib/cadmicro/query-keys.ts`).

## Checklist — remover mocks quando a API estiver no ar

1. Deploy dos endpoints de veículos no app-rmi (staging/prod).
2. `NEXT_PUBLIC_CADMICRO_USE_MOCKS=false` no ambiente.
3. Smoke: lista, detalhe, create, edit, invite, accept/reject, remove conductor, leave.
4. Remover branches `if (isCadmicroMocksEnabled())` nos services/actions e fixtures em `carteira/cadmicro/mocks/` + catálogo mock se o GET de brands/models/colors estiver estável.
5. Opcional: handlers MSW só para testes unitários.

## Ver também

- Upload GCS: [`cadmicro-gcs-upload.md`](./cadmicro-gcs-upload.md)
- Domínios / flags: [`agents/04-domains.md`](./agents/04-domains.md)

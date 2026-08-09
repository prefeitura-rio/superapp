# RioMob — Integração API (Orval + mocks + Query + Actions)

## Arquitetura

| Camada | Papel |
|--------|--------|
| `src/http/mobilidade/` | Clients Orval (app-rmi) |
| `src/lib/riomob/*-service.ts` | Gate mock vs API + mappers UI |
| `src/app/api/riomob/{vehicles,invitations,catalog}/*` | BFF GET (cookies → Bearer) |
| `src/hooks/riomob/*` | TanStack Query + invalidação |
| `src/actions/riomob/*` | Mutations (Server Actions) + `revalidatePath` |

Upload GCS continua em `/api/riomob/files/*` (sem mudança).

## Flag de mocks

`NEXT_PUBLIC_RIOMOB_USE_MOCKS`:

- **unset ou qualquer valor ≠ `false`** → GETs retornam fixtures; mutations short-circuit com `{ success: true }` (fluxo de UI testável sem API).
- **`false`** → Orval real via `BASE_API_URL_RMI`.

Gate único: [`src/lib/riomob/mocks-gate.ts`](../src/lib/riomob/mocks-gate.ts).

Com mocks OFF, falha de GET **não** cai em fixture no client: a UI dispara toast de erro; no catálogo (marcas/modelos/cores) o bottomsheet mostra “Não foi possível carregar…”.

## Cache após mutation

1. **Server Action** chama `revalidatePath('/carteira')` e paths do veículo.
2. **Client** chama `useInvalidateRiomobQueries()` (keys em `src/lib/riomob/query-keys.ts`).

## Checklist — remover mocks quando a API estiver no ar

1. Deploy dos endpoints de veículos no app-rmi (staging/prod).
2. `NEXT_PUBLIC_RIOMOB_USE_MOCKS=false` no ambiente.
3. Smoke: lista, detalhe, create, edit, invite, accept/reject, remove conductor, leave.
4. Remover branches `if (isRiomobMocksEnabled())` nos services/actions e fixtures em `carteira/riomob/mocks/` + catálogo mock se o GET de brands/models/colors estiver estável.
5. Opcional: handlers MSW só para testes unitários.

## Ver também

- Upload GCS: [`riomob-gcs-upload.md`](./riomob-gcs-upload.md)
- Domínios / flags: [`agents/04-domains.md`](./agents/04-domains.md)

# CadMicro — Integração API (Orval + Query + Actions)

## Arquitetura

| Camada | Papel |
|--------|--------|
| `src/http/mobilidade/` | Clients Orval (app-rmi) |
| `src/lib/cadmicro/*-service.ts` | Chamadas API + mappers UI |
| `src/app/api/cadmicro/{vehicles,invitations,catalog}/*` | BFF GET (cookies → Bearer) |
| `src/hooks/cadmicro/*` | TanStack Query + invalidação |
| `src/actions/cadmicro/*` | Mutations (Server Actions) + `revalidatePath` |

Upload GCS continua em `/api/cadmicro/files/*` (sem mudança).

GETs e mutations usam Orval via `BASE_API_URL_RMI`. Falha de GET dispara toast de erro na UI; no catálogo (marcas/modelos/cores) o bottomsheet mostra “Não foi possível carregar…”.

## Cache após mutation

1. **Server Action** chama `revalidatePath('/carteira')` e paths do veículo.
2. **Client** chama `useInvalidateCadmicroQueries()` (keys em `src/lib/cadmicro/query-keys.ts`).

## Ver também

- Upload GCS: [`cadmicro-gcs-upload.md`](./cadmicro-gcs-upload.md)
- Domínios / flags: [`agents/04-domains.md`](./agents/04-domains.md)

# Migração Carta de Serviços — comparativo da página de detalhe

Comparação entre `app-busca-search` (`ModelsPrefRioService`) e a API Pref.Rio Carta de Serviços (`ServiceDetail` via `GET /services/{slug}`).

## Feature flag

```env
# Default: false — produção permanece em app-busca-search
CARTA_SERVICOS_API_ENABLED=true
```

Quando `false` (padrão), o superapp usa `app-busca-search` como antes. Quando `true`, categorias, subcategorias, listagens e detalhe de serviço usam `http-pref-rio-carta-servicos` com mappers em `src/lib/carta-servicos/`.

## Veredito

| Pergunta | Resposta |
|---|---|
| A nova API cobre a UI atual? | Sim, com mapper |
| Drop-in replacement? | Não — shape flat vs nested |
| Downgrade inevitável? | Pequeno (`is_enabled` em botões; whitelist de IDs) |

## Campos usados na UI ativa (`PageClient`)

| Campo UI | API antiga | API nova | Status |
|---|---|---|---|
| Título | `nome_servico` | `name` | Mapper |
| Resumo | `resumo` | `info.summary` | Mapper |
| Custo | `custo_servico` | `info.cost` | Mapper |
| Prazo | `tempo_atendimento` | `info.serviceDeadline` | Mapper |
| Categoria | `tema_geral` | `themeName` | Mapper |
| Endereços | `canais_presenciais[]` | `channels[]` Presencial | Mapper |
| Canais digitais | `canais_digitais[]` | `channels[]` Digital/Telefone | Mapper |
| Descrição completa | `descricao_completa` | `info.fullDescription` | Mapper |
| Como solicitar | `instrucoes_solicitante` | `howToRequest.instructions` | Mapper |
| Resultado | `resultado_solicitacao` | `howToRequest.serviceResult` | Mapper |
| Documentos | `documentos_necessarios[]` | `howToRequest.requiredDocs[]` | Mapper |
| Não cobre | `servico_nao_cobre` | `howToRequest.exclusions` | Mapper |
| Legislação | `legislacao_relacionada[]` | `legislation[].titulo` | Mapper |
| Botões | `buttons[].titulo/url_service/is_enabled` | `buttons[].title/url` — sem `is_enabled` | Gap menor |
| Última atualização | `last_update` (unix) | `lastModifiedDate` (ISO) | Mapper |
| Publicado | `status === 1` | `articleStatus === 'Online'` | Mapper |
| Órgão gestor | `orgao_gestor[0]` | `responsibleOrgUnit` | Mapper |

## Arquivos da integração

| Arquivo | Papel |
|---|---|
| `src/constants/venvs.ts` | `CARTA_SERVICOS_API_ENABLED` |
| `src/lib/carta-servicos/mappers.ts` | `ServiceDetail` → `ModelsPrefRioService` |
| `src/lib/carta-servicos/fetch.ts` | Chamadas à nova API |
| `src/lib/categories.ts` | Branch por flag |
| `src/lib/services-utils.ts` | Branch por flag |

## Gaps conhecidos

1. **`buttons[].is_enabled`** — ausente na nova API; mapper assume `true`.
2. **`awaiting_approval`** — ausente; confiar em `articleStatus === 'Online'`.
3. **`SERVICE_WHITELIST`** em `page.tsx` — IDs antigos; revisar ao habilitar em prod.
4. **Ordenação de categorias** — sem `popularity_score`; fallback por `publishedServices`.

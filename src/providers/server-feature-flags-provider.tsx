'use client'

import { type ReactNode, createContext, useContext } from 'react'

/**
 * Flags só de servidor (sem `NEXT_PUBLIC_`) de que client components precisam.
 *
 * `process.env.FEATURE_SALESFORCE` não existe no navegador: um client
 * component que chama `isSalesforceServicesEnabled()` sempre recebe `false`.
 * O root layout (dinâmico) lê as flags a cada requisição e as entrega aqui, o
 * que mantém a leitura em runtime (a flag muda no Infisical sem rebuild).
 */
export interface ServerFeatureFlags {
  salesforce: boolean
  /** `FEATURE_SGRC_HISTORICO`: histórico do 1746 legado em Minhas Solicitações. */
  sgrcHistorico: boolean
}

/** Sem provider, tudo desligado: o mesmo padrão seguro da flag ausente. */
const DEFAULT_SERVER_FEATURE_FLAGS: ServerFeatureFlags = {
  salesforce: false,
  sgrcHistorico: false,
}

const ServerFeatureFlagsContext = createContext<ServerFeatureFlags>(
  DEFAULT_SERVER_FEATURE_FLAGS
)

export function ServerFeatureFlagsProvider({
  flags,
  children,
}: {
  flags: ServerFeatureFlags
  children: ReactNode
}) {
  return (
    <ServerFeatureFlagsContext.Provider value={flags}>
      {children}
    </ServerFeatureFlagsContext.Provider>
  )
}

export function useServerFeatureFlags(): ServerFeatureFlags {
  return useContext(ServerFeatureFlagsContext)
}

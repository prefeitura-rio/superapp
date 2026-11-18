'use client'

import { type ReactNode, createContext, useContext } from 'react'

/**
 * Flags lidas no servidor em runtime (sem prefixo `NEXT_PUBLIC_`), que o
 * bundle do cliente não enxerga em `process.env`. O `RootLayout` (Server
 * Component) lê os valores e os entrega aqui, para os client components que
 * não recebem a flag por prop (ex.: o menu global, montado no header).
 */
export interface RuntimeFeatureFlags {
  /** `FEATURE_SALESFORCE === 'true'` no servidor. */
  salesforce: boolean
}

/** Sem provider, tudo desligado: o mesmo comportamento da flag ausente. */
const DISABLED: RuntimeFeatureFlags = { salesforce: false }

const FeatureFlagsContext = createContext<RuntimeFeatureFlags>(DISABLED)

export function FeatureFlagsProvider({
  flags,
  children,
}: {
  flags: RuntimeFeatureFlags
  children: ReactNode
}) {
  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useRuntimeFeatureFlags(): RuntimeFeatureFlags {
  return useContext(FeatureFlagsContext)
}

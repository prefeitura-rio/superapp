import { DividaAtivaLanding } from '@/app/components/divida-ativa/divida-ativa-landing'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { getDalDividaAtivaImoveis } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

/**
 * Landing do módulo de Dívida Ativa Imobiliária.
 *
 * **Exige login.** O módulo vive em `/divida-ativa`, fora da allowlist de rotas públicas do
 * `src/middleware.ts` — o middleware redireciona anônimo para o id.rio. A proteção vem da
 * URL, não do nome do grupo de rotas `(logged-in)`. Por isso o módulo **não** pode voltar
 * para `/servicos/*`, que é público por allowlist.
 *
 * A página lê **uma** informação do cidadão: quantos imóveis ele cadastrou, para o contador
 * do card "Meus imóveis". É dado patrimonial, então vem pelo DAL com `no-store` e CPF
 * mascarado no span. Se essa leitura falhar, a landing continua de pé sem o número — a lista
 * de serviços não pode cair por causa de um contador.
 *
 * Sem `export const dynamic = 'force-static'` de propósito: o root layout lê `headers()` para
 * o nonce da CSP, o que torna toda página do app renderizada sob demanda. A diretiva não teria
 * efeito nenhum aqui e só passaria a impressão errada.
 *
 * O módulo inteiro está atrás de `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA` — ver `docs/divida-ativa.md`.
 */

export default async function DividaAtivaPage() {
  const { cpf } = await getUserInfoFromToken()

  let quantidadeImoveis: number | null = null

  if (cpf) {
    try {
      const imoveis = await getDalDividaAtivaImoveis(cpf)
      quantidadeImoveis = imoveis.length
    } catch {
      quantidadeImoveis = null
    }
  }

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pb-4 text-foreground">
      <ProfileHeaderWrapper />

      <DividaAtivaLanding quantidadeImoveis={quantidadeImoveis} />
    </div>
  )
}

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SolicitacoesRootPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.has('access_token')

  if (isLoggedIn) {
    redirect('/minhas-solicitacoes')
  }

  redirect('/consulta-protocolo')
}

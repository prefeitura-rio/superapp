import { redirect } from 'next/navigation'

export default function CadmicroPage() {
  redirect('/carteira?mobilidade=true')
}

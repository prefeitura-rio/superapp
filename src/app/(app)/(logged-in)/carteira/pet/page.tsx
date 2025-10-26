import { redirect } from 'next/navigation'

export default function PetPage() {
  redirect('/carteira?pets=true')
}

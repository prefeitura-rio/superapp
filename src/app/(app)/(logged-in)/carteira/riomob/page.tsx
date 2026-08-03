import { redirect } from 'next/navigation'

export default function RiomobPage() {
  redirect('/carteira?riomob=true')
}

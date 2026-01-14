import { getMeiCompanyData } from './get-mei-company-data'
import { MeuMeiClient } from './meu-mei-client'

export default async function MeuMeiPage() {
  const companyData = await getMeiCompanyData()

  return <MeuMeiClient companyData={companyData} />
}

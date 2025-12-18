import { MeiProposalSuccessClient } from './mei-proposal-success-client'

export default async function MeiProposalSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <MeiProposalSuccessClient slug={slug} />
}

import { SecondaryHeader } from '@/app/components/secondary-header'
import { FormattedContent, type FaqSection } from '@/lib/faq-utils'

const MEI_FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'plataforma',
    title: 'O que é a Plataforma MEI Carioca?',
    content:
      'A Plataforma MEI Carioca é uma iniciativa da Prefeitura do Rio de Janeiro que conecta Microempreendedores Individuais (MEIs) a oportunidades de prestação de serviços para órgãos públicos municipais.',
  },
  {
    id: 'objetivo',
    title: 'Qual o objetivo do projeto?',
    content:
      'Levar oportunidades de contratação para MEIs em todo o município do Rio de Janeiro, facilitando o acesso a serviços públicos e promovendo o desenvolvimento econômico local.',
  },
  {
    id: 'quem-pode',
    title: 'Quem pode participar?',
    content:
      'Microempreendedores Individuais (MEIs) regularmente cadastrados e habilitados para as atividades solicitadas em cada oportunidade. É necessário possuir CNPJ MEI ativo e estar em dia com as obrigações fiscais.',
  },
  {
    id: 'como-funciona',
    title: 'Como funciona o processo de contratação?',
    content:
      'O MEI envia uma proposta para a oportunidade desejada através da plataforma. A secretaria responsável analisa as propostas recebidas e entra em contato com os selecionados para formalização via Plataforma +Brasil, conforme disposições legais aplicáveis.',
  },
  {
    id: 'pagamento',
    title: 'Como é feito o pagamento?',
    content:
      'O pagamento é realizado via empenho, geralmente em até 30 dias após a emissão da nota fiscal e conclusão satisfatória do serviço. O prazo específico de cada oportunidade está indicado na descrição.',
  },
  {
    id: 'proposta-paga',
    title: 'O envio de proposta é pago?',
    content:
      'Não. O envio de propostas é totalmente gratuito. Não há nenhum custo para participar das oportunidades disponíveis na plataforma.',
  },
  {
    id: 'varias-propostas',
    title: 'Posso enviar proposta para mais de uma oportunidade?',
    content:
      'Sim, você pode enviar propostas para quantas oportunidades desejar, desde que seu MEI esteja habilitado para as atividades solicitadas em cada uma delas.',
  },
  {
    id: 'cancelar-proposta',
    title: 'Como faço para cancelar uma proposta enviada?',
    content:
      'Para cancelar uma proposta, acesse a seção "Minhas propostas" e clique em "Cancelar proposta" na oportunidade desejada. O cancelamento só é possível enquanto a proposta estiver em análise.',
  },
]

export const dynamic = 'force-static'

export default function MeiFaqPage() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader title="FAQ" fixed={false} />
      <div className="p-5 pt-4 max-w-4xl mx-auto">
        <div className="space-y-8">
          {MEI_FAQ_SECTIONS.map((section, index) => (
            <div key={section.id}>
              <div className="space-y-2">
                <h2 className="text-lg font-medium tracking-normal leading-5">
                  {section.title}
                </h2>
                <FormattedContent content={section.content} />
              </div>
              {index < MEI_FAQ_SECTIONS.length - 1 && (
                <div className="mt-8 border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

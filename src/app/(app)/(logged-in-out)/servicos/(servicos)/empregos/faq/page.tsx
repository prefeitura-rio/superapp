import { SecondaryHeader } from '@/app/components/secondary-header'
import { type FaqSection, FormattedContent } from '@/lib/faq-utils'

const EMPREGOS_FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'plataforma',
    title: 'O que é a Plataforma de empregos?',
    content:
      'O Município do Rio de Janeiro, por meio da Secretaria Municipal de Ciência, Tecnologia e Inovação – SMCT, com o apoio do Senac RJ, oferece a oportunidade de disseminação gratuita de cursos à população nos eixos de Empreendedorismo Inovador, Comunicação, Tecnologia básica e aplicada.',
  },
  {
    id: 'objetivo',
    title: 'Qual o objetivo do projeto?',
    content:
      'Levar oportunidades para todo o município, atrair novos públicos para o universo digital e contribuir com a melhoria da qualidade de vida por meio da difusão e promoção de Tecnologia, Inovação, Empreendedorismo, Economia Criativa e Comunicação.',
  },
  {
    id: 'gratuitos',
    title: 'Todos os cursos do projeto são gratuitos?',
    content:
      'Sim, todos os cursos oferecidos para a população serão gratuitos.',
  },
  {
    id: 'quem-se-inscrever',
    title: 'Quem pode se inscrever?',
    content:
      'Residentes no Município do Rio de Janeiro com idade a partir de 16 anos e Ensino Fundamental completo.\n* Funcionários Senac não podem participar do projeto.',
  },
  {
    id: 'idade-inscricao',
    title: 'Há idade para se inscrever?',
    content: 'Sim. Pessoas a partir de 16 anos podem se inscrever.',
  },
  {
    id: 'pre-inscricao-paga',
    title: 'A pré-inscrição é paga?',
    content: 'Não. A Pré-inscrição é gratuita.',
  },
]

export const dynamic = 'force-static'

export default function EmpregosFaqPage() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader title="FAQ" fixed={false} />
      <div className="p-5 pt-4 max-w-4xl mx-auto">
        <div className="space-y-8">
          {EMPREGOS_FAQ_SECTIONS.map((section, index) => (
            <div key={section.id}>
              <div className="space-y-2">
                <h2 className="text-lg font-medium tracking-normal leading-5">
                  {section.title}
                </h2>
                <FormattedContent
                  content={section.content}
                  className="text-foreground"
                />
              </div>
              {index < EMPREGOS_FAQ_SECTIONS.length - 1 && (
                <div className="mt-8 border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

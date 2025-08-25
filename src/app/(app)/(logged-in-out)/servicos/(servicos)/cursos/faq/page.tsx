import { SecondaryHeader } from '@/app/components/secondary-header'

export default function FaqPage() {
  const sections = [
    {
      title: 'O que é a Plataforma GoRio?',
      content:
        'O Município do Rio de Janeiro, por meio da Secretaria Municipal de Ciência, Tecnologia e Inovação – SMCT, com o apoio do Senac RJ, oferece a oportunidade de disseminação gratuita de cursos à população nos eixos de Empreendedorismo Inovador, Comunicação, Tecnologia básica e aplicada.',
    },
    {
      title: 'Qual o objetivo do projeto?',
      content:
        'Levar oportunidades para todo o município, atrair novos públicos para o universo digital e contribuir com a melhoria da qualidade de vida por meio da difusão e promoção de Tecnologia, Inovação, Empreendedorismo, Economia Criativa e Comunicação.',
    },
    {
      title: 'Todos os cursos do projeto são gratuitos?',
      content:
        'Sim, todos os cursos oferecidos para a população serão gratuitos.',
    },
    {
      title: 'Quem pode se inscrever?',
      content:
        'Residentes no Município do Rio de Janeiro com idade a partir de 16 anos e Ensino Fundamental completo. *Funcionários Senac não podem participar do projeto.',
    },
    {
      title: 'Quais áreas são cobertas?',
      content:
        'A plataforma oferece cursos em Tecnologia da Informação, Marketing Digital, Empreendedorismo, Comunicação Visual, Economia Criativa, Inovação e Desenvolvimento de Aplicativos, sempre com foco na aplicação prática do conhecimento.',
    },
    {
      title: 'Certificação e acompanhamento',
      content:
        'Todos os cursos oferecem certificado de conclusão reconhecido pelo Senac RJ. Além disso, os participantes recebem acompanhamento pedagógico e suporte técnico durante todo o período de estudos.',
    },
  ]
  return (
    <main className="max-w-4xl min-h-lvh mx-auto pt-15 text-foreground">
      <SecondaryHeader title="FAQ" />
      <div className="p-5 pt-10 max-w-4xl mx-auto">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index}>
              <div className="space-y-2">
                <h2 className="text-lg font-medium leading-tight tracking-normal">
                  {section.title}
                </h2>
                <p className="text-foreground-light text-sm leading-relaxed opacity-50">
                  {section.content}
                </p>
              </div>
              {index < sections.length - 1 && (
                <div className="mt-8 border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

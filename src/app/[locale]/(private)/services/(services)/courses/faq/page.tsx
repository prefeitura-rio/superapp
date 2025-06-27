import { ServicesHeader } from '../../../components/services-header'

export default function FaqPage() {
  const sections = [
    {
      title: 'O que é a Plataforma GoRio?',
      content:
        'O Município do Rio de Janeiro, por meio da Secretaria Municipal de Ciência, Tecnologia e Inovação – SMCTI, com o apoio do Senac RJ, oferece a oportunidade de disseminação gratuita de cursos à população nos eixos de Empreendedorismo Inovador, Comunicação, Tecnologia básica e aplicada.',
    },
    {
      title: 'Qual o objetivo do projeto?',
      content:
        'Levar oportunidades para todo o município, atrair novos públicos para o universo digital e contribuir com a melhoria da qualidade de vida por meio da difusão e promoção de Tecnologia, Inovação, Empreendedorismo, Economia Criativa e Comunicação.',
    },
    {
      title: 'Quem pode participar?',
      content:
        'Todos os cidadãos do Rio de Janeiro maiores de 16 anos podem se inscrever nos cursos oferecidos pela plataforma. Não é necessário ter conhecimento prévio, pois oferecemos desde cursos básicos até avançados em diversas áreas.',
    },
    {
      title: 'Como funciona a inscrição?',
      content:
        'As inscrições são realizadas através da plataforma online, onde você pode escolher entre os cursos disponíveis, verificar horários e locais das aulas. O processo é totalmente gratuito e as vagas são limitadas por turma.',
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
    <main className="max-w-md min-h-lvh mx-auto pt-15 text-white">
      <ServicesHeader title="FAQ" />
      <div className="text-white p-5 pt-10 max-w-md mx-auto">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index}>
              <div className="space-y-4">
                <h2 className="text-xl font-bold leading-tight">
                  {section.title}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {section.content}
                </p>
              </div>
              {index < sections.length - 1 && (
                <div className="mt-8 border-t border-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

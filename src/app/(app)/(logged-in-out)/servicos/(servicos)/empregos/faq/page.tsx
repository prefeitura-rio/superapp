import { SecondaryHeader } from '@/app/components/secondary-header'
import { type FaqSection, FormattedContent } from '@/lib/faq-utils'

const EMPREGOS_FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'plataforma',
    title: 'O que é a Plataforma Oportunidades Cariocas? ',
    content:
      'O Oportunidades Cariocas é a plataforma digital da Prefeitura do Rio que reúne, em um só lugar, inscrições para cursos, oficinas e diversas atividades educativas do município e de instituições parceiras. Focado no seu desenvolvimento, o Oportunidades Cariocas também funciona como uma ponte para o mercado de trabalho, oferecendo vagas de emprego atualizadas e um ambiente exclusivo para Microempreendedores Individuais (MEIs) encontrarem novas oportunidades de serviços e impulsionarem seus negócios.',
  },
  {
    id: 'objetivo',
    title: 'Quem pode se candidatar às vagas de emprego?',
    content:
      'Qualquer cidadão morador do Rio de Janeiro pode se candidatar, desde que possua uma conta ativa no Gov.br. \n\n No Oportunidades Cariocas, você pode consultar as vagas abertas, conferir se o seu perfil se encaixa nas exigências de cada empregador e enviar sua candidatura de forma rápida e gratuita.',
  },
  {
    id: 'conta-govbr',
    title: 'O que é a conta Gov.br e por que preciso dela para me cadastrar?',
    content:
      'A conta Gov.br é a sua identidade digital para acessar de forma segura e prática os serviços digitais do governo. Qualquer cidadão brasileiro ou estrangeiro com registro na base de dados do Cadastro de Pessoas Físicas (CPF) pode criar a sua conta. \n\n O acesso pelo gov.br garante a segurança dos seus dados e valida sua identidade, trazendo mais confiança para o processo. Com ele, você envia suas candidaturas de forma rápida e acompanha cada etapa do processo seletivo diretamente pela plataforma.',
  },
  {
    id: 'sem-conta-govbr',
    title: 'Não tenho uma conta Gov.br. Como posso criar uma?',
    content:
      'Você pode criar sua conta de forma gratuita e rápida pelo site ou aplicativo do Gov.br. Basta seguir as instruções e preencher os dados solicitados. \n\n Ficou com dúvida? Assista o vídeo “Saiba como criar uma conta GOV.BR [OFICIAL]” através do link https://www.youtube.com/watch?v=qmqJqr3fN5w',
  },
  {
    id: 'esqueci-senha',
    title: 'Esqueci a senha da minha conta Gov.br. O que devo fazer?',
    content:
      'Você pode recuperar sua senha diretamente no site ou aplicativo do Gov.br. Basta seguir o processo de "Esqueci minha senha" e usar o método de recuperação que preferir (e-mail, celular ou reconhecimento facial, dependendo do nível da sua conta). \n\n Ficou com dúvida? Assista o vídeo “Como recuperar a senha de sua conta GOV.BR? [OFICIAL]” através do link https://www.youtube.com/watch?v=H5LC7saob7M&t=1s',
  },
  {
    id: 'candidatura',
    title: 'Como realizar a candidatura em uma vaga de emprego?',
    content:
      'Escolha a vaga de seu interesse e, após conferir os requisitos, clique em “Fazer login para se candidatar” (ou diretamente em “Candidatar-se à vaga”, caso já esteja logado). \n\n Na sequência, preencha os campos para criar seu currículo. Suas informações ficarão salvas na plataforma, o que agiliza sua inscrição em outras vagas de interesse e permite que você atualize seus dados sempre que quiser. \n\n Para finalizar, clique em “Continuar” e conclua sua candidatura. Depois disso, basta acompanhar o status do processo seletivo aqui na plataforma. Fique de olho também no seu e-mail, pois enviaremos atualizações por lá sempre que houver novidades.',
  },
  {
    id: 'mais-de-uma-vaga',
    title: 'Posso me inscrever em mais de uma vaga de emprego?',
    content:
      'Sim, você pode se inscrever em mais de uma vaga de emprego ao mesmo tempo.',
  },
  {
    id: 'acompanhar-candidatura',
    title: 'Como posso acompanhar a minha candidatura na vaga?',
    content:
      'Assim que você finalizar sua inscrição, enviaremos uma confirmação para o seu e-mail cadastrado. Através desse mesmo e-mail, você também receberá avisos sobre os resultados e as atualizações de cada etapa do processo seletivo. \n\n Se preferir, você pode acompanhar o status da sua candidatura a qualquer momento pelo Oportunidades Cariocas. Basta fazer login e acessar a aba "Minhas candidaturas", no canto superior direito. Lá, você encontrará o histórico completo de todas as suas inscrições e o progresso de cada uma delas.',
  },
  {
    id: 'candidatura-aprovada',
    title: 'O que fazer quando minha candidatura for aprovada?',
    content:
      'Enviaremos um e-mail informando o resultado da sua candidatura. Caso você seja selecionado, a empresa ou o órgão parceiro também entrará em contato por telefone ou e-mail. Por isso, é muito importante manter seus dados sempre atualizados para não perder nenhuma oportunidade.',
  },
  {
    id: 'candidatura-status',
    title: 'O que significa os status que aparecem nas minhas candidaturas?',
    content:
      '**Candidatura “Em análise”**:  Indica que a candidatura foi recebida e que você está participando do processo seletivo. A empresa ou o órgão parceiro está avaliando os perfis, o que pode incluir a triagem de currículos ou a realização de etapas como entrevistas e dinâmicas. \n\n **Candidatura “Aprovado”**: Indica que você foi selecionado para a vaga . Agora, é só ficar de olho no seu telefone ou e-mail e aguardar o contato da empresa para os próximos passos. \n\n **Candidatura “Não selecionado”**:  Indica que o processo avançou com outros perfis que atendiam mais especificamente aos critérios da vaga no momento. Seu currículo permanece no sistema para futuras oportunidades que combinem com suas experiências. \n\n **Candidatura “Vaga descontinuada”**: Indica que a empresa optou por cancelar a oferta da vaga ou suspender o processo seletivo.',
  },
  {
    id: 'alteracoes-curriculo',
    title: 'Como incluir ou alterar informações do meu currículo?',
    content:
      'Faça login e clique na aba "Meu currículo", no canto superior direito da tela. Lá, você pode atualizar suas informações ou incluir novas experiências profissionais sempre que precisar.',
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

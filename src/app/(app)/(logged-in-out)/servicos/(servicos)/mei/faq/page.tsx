import { SecondaryHeader } from '@/app/components/secondary-header'
import { type FaqSection, FormattedContent } from '@/lib/faq-utils'

const MEI_FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'plataforma',
    title: 'O que é a Plataforma Oportunidades Cariocas?',
    content:
      'O Oportunidades Cariocas é uma plataforma digital da Prefeitura do Rio que conecta você a oportunidades de desenvolvimento profissional e pessoal. Nela, além dos cursos oferecidos pela Prefeitura e por instituições parceiras, há um espaço exclusivo de oportunidades a Microempreendedores Individuais (MEIs), impulsionando o empreendedorismo local.',
  },
  {
    id: 'quem-pode',
    title: 'Quem pode participar e enviar propostas?',
    content:
      'Qualquer pessoa que tenha um Cadastro Nacional da Pessoa Jurídica (CNPJ) de Microempreendedor Individual (MEI) ativo e em situação regular.',
  },
  {
    id: 'govbr',
    title: 'O que é a conta Gov.br e por que preciso dela para me cadastrar?',
    content:
      'A conta Gov.br é a sua identidade digital para acessar de forma segura e prática os serviços digitais do governo. Qualquer cidadão brasileiro ou estrangeiro com registro na base de dados do Cadastro de Pessoas Físicas (CPF) pode criar a sua conta.\n\nÉ o meio de acesso para que possamos garantir a segurança dos seus dados e a validação da sua identidade, além de simplificar o processo de contratação dos serviços oferecidos na plataforma.',
  },
  {
    id: 'criar-govbr',
    title: 'Não tenho uma conta Gov.br. Como posso criar uma?',
    content:
      'Você pode criar sua conta de forma gratuita e rápida pelo site ou aplicativo do Gov.br. Basta seguir as instruções e preencher os dados solicitados.\n\nFicou com dúvida? Assista o vídeo "Saiba como criar uma conta GOV.BR [OFICIAL]" através do link https://www.youtube.com/watch?v=qmqJqr3fN5w',
  },
  {
    id: 'senha-govbr',
    title: 'Esqueci a senha da minha conta Gov.br. O que devo fazer?',
    content:
      'Você pode recuperar sua senha diretamente no site ou aplicativo do Gov.br. Basta seguir o processo de "Esqueci minha senha" e usar o método de recuperação que preferir (e-mail, celular ou reconhecimento facial, dependendo do nível da sua conta).\n\nFicou com dúvida? Assista o vídeo "Como recuperar a senha de sua conta GOV.BR? [OFICIAL]" através do link https://www.youtube.com/watch?v=H5LC7saob7M',
  },
  {
    id: 'servicos-disponiveis',
    title: 'Como fico sabendo dos serviços que a Prefeitura do Rio precisa?',
    content:
      'A Prefeitura vai publicar oportunidades de serviços que precisa contratar no Oportunidades Cariocas. Você pode ver a lista de serviços disponíveis e escolher aqueles que te interessam.',
  },
  {
    id: 'como-funciona-proposta',
    title: 'Como funciona a proposta?',
    content:
      'Depois de escolher o serviço que te interessa, você precisa fazer o login para enviar a proposta. Feito isso, nosso sistema já identifica seu CNPJ de MEI vinculado ao seu CPF.\n\nConfirme suas informações e atualize os dados de contato (e-mail e telefone), se necessário. É muito importante manter esses contatos corretos, pois é por eles que a Prefeitura falará com você se sua proposta for escolhida.\n\nPara finalizar, é só informar o valor total e o prazo previsto para a conclusão do serviço. Revise tudo com atenção e clique em "Enviar proposta".',
  },
  {
    id: 'alterar-proposta',
    title: 'Fiz uma proposta, mas preciso alterar o valor. O que eu faço?',
    content:
      'Você pode mudar o valor da sua proposta enquanto o prazo de envio ainda estiver aberto. É só fazer login na sua conta, acessar a aba "Minhas propostas" no canto superior direito, encontrar a proposta que você quer alterar e clicar no ícone de edição (um lápis).\n\nEm seguida, digite o novo valor e, por fim, clique em "Editar proposta". Pronto, a sua proposta foi alterada com sucesso.',
  },
  {
    id: 'apos-envio',
    title: 'O que acontece depois que eu envio a proposta?',
    content:
      'Depois de enviar sua proposta, a Prefeitura vai analisar todas as propostas recebidas. Você não precisa fazer mais nada, é só aguardar.\n\nPara te manter atualizado, nós enviaremos um e-mail informando se a sua proposta foi selecionada ou não. Além disso, você pode acompanhar o andamento de todas as propostas que já enviou acessando a aba "Minhas Propostas" na plataforma.',
  },
  {
    id: 'proposta-selecionada',
    title: 'O que fazer quando minha proposta for selecionada?',
    content:
      'A unidade responsável entrará em contato com você pelos meios de contato informados na proposta. Por isso, mantenha essas informações atualizadas.',
  },
  {
    id: 'pagamento',
    title: 'Depois de prestar o serviço, quando vou receber o pagamento?',
    content:
      'Terminou o serviço? Você deve emitir a nota fiscal para a Prefeitura do Rio de Janeiro ou para o órgão/unidade municipal que vai fazer o pagamento. A forma e o prazo de pagamento estão na descrição da oportunidade.',
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
                <FormattedContent
                  content={section.content}
                  className="text-foreground"
                />
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

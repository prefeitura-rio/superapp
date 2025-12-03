export type FAQContent = string | string[]

export interface FAQItem {
  title: string
  content: FAQContent
}

export interface FAQSection {
  id: string
  title?: string
  items: FAQItem[]
}

export const faqSections: FAQSection[] = [
  {
    id: 'perguntas-frequentes',
    items: [
      {
        title: 'O que é a Plataforma PrefRio?',
        content:
          'É uma plataforma digital que vai concentrar em um só lugar os serviços e informações dos atuais portais Prefeitura.rio, Carioca Digital e 1746. O objetivo é simplificar o acesso e tornar o atendimento mais rápido, inteligente e personalizado.',
      },
      {
        title: 'Quem pode acessar?',
        content:
          'Qualquer cidadão, com login Gov.br, poderá acessar o portal e consultar seus dados e serviços.',
      },
      {
        title: 'Quais dados eu consigo acessar no meu login?',
        content: [
          'Informações pessoais',
          'Caso tenha cadastro nos seguintes serviços, você poderá visualizar na sua conta da PrefRio:',
          'Clínica da Família',
          'Escola de Jovens e Adultos',
          'CadÚnico',
          'Cuidados com a Cidade',
          'Dados de qualquer serviço que você tenha solicitado na Prefeitura',
        ],
      },
      {
        title: 'Consigo solicitar algum serviço dentro do PrefRio?',
        content:
          'No momento, os cidadãos vão ser redirecionados para solicitar os serviços no portal do 1746 ou Carioca Digital. Estamos trabalhando para que você possa solicitar os serviços diretamente do PrefRio.',
      },
      {
        title: 'Quando o portal estará 100% operacional?',
        content:
          'O portal será implantado em fases: primeiro com centralização de informações dos serviços mais acessados e, gradualmente, com os demais serviços. Até 2026 todos os serviços estarão disponíveis diretamente na nova plataforma.',
      },
      {
        title:
          'O que vai acontecer com os portais Prefeitura.rio, Carioca Digital e 1746?',
        content:
          'Eles serão integrados e, aos poucos, desativados. Toda a navegação e serviços estarão concentrados no Portal Unificado, evitando duplicidade e dispersão de informações.',
      },
    ],
  },
  {
    id: 'funcionalidades-servicos',
    title: 'Funcionalidades e Serviços',
    items: [
      {
        title: 'Quais serviços estarão disponíveis no lançamento?',
        content:
          'No início, o cidadão poderá acessar dados pessoais, histórico de interações com a Prefeitura e informações sobre serviços mais utilizados, como: Saúde (Clínica da Família), Educação (Escola de Jovens e Adultos), Assistência Social (CadÚnico), Cuidados com a Cidade e seus dados cadastrados.',
      },
      {
        title: 'Será possível solicitar serviços diretamente no portal?',
        content:
          'Na primeira fase, alguns pedidos ainda serão redirecionados para os portais originais. O objetivo é que, em breve, todos os serviços possam ser solicitados dentro do próprio portal, sem redirecionamento.',
      },
      {
        title: 'O portal terá integração com WhatsApp?',
        content:
          'Sim. A partir de 2026, parte dos serviços mais demandados pela população também estará disponível no WhatsApp, com atendimento automatizado e previsões de resposta rápidas.',
      },
      {
        title: 'Consigo solicitar algum serviço dentro do PrefRio?',
        content:
          'No momento, os cidadãos vão ser redirecionados para solicitar os serviços no portal do 1746 ou Carioca Digital. Estamos trabalhando para que você possa solicitar os serviços diretamente do PrefRio.',
      },
      {
        title: 'Quando o portal estará 100% operacional?',
        content:
          'O portal será implantado em fases: primeiro com centralização de informações dos serviços mais acessados e, gradualmente, com os demais serviços. Até 2026 todos os serviços estarão disponíveis diretamente na nova plataforma.',
      },
    ],
  },
  {
    id: 'experiencia-usuario',
    title: 'Experiência do Usuário',
    items: [
      {
        title: 'Como será garantida a usabilidade do portal?',
        content:
          'O portal está em fase de testes com servidores e cidadãos, que avaliam a experiência e enviam feedbacks. Isso permite ajustar layout, funcionalidades e linguagem antes do lançamento definitivo.',
      },
      {
        title: 'Será possível avaliar os serviços?',
        content:
          'Sim. O portal terá espaço para envio de feedback através da ouvidoria sobre os serviços utilizados, permitindo que a Prefeitura melhore continuamente a experiência digital.',
      },
      {
        title: 'Haverá acessibilidade para pessoas com deficiência?',
        content:
          'Sim. O portal está sendo desenvolvido seguindo normas de acessibilidade digital, com recursos de leitura de tela, contraste adequado e navegação simplificada.',
      },
    ],
  },
  {
    id: 'seguranca-transparencia',
    title: 'Segurança e Transparência',
    items: [
      {
        title: 'Meus dados estarão seguros no Portal Unificado?',
        content:
          'Sim. O portal segue a Lei Geral de Proteção de Dados (LGPD) e adota padrões avançados de criptografia e segurança digital. Apenas o cidadão terá acesso aos seus dados pessoais, por isso os dados de login e senha devem ser pessoais e intransferíveis.',
      },
      {
        title: 'Quem pode ver minhas informações no portal?',
        content:
          'Somente o próprio cidadão autenticado no login Gov.br poderá visualizar seus dados. Nenhuma informação será compartilhada sem autorização.',
      },
      {
        title: 'Como a Prefeitura vai usar meus dados?',
        content:
          'As informações servirão para melhorar a personalização dos serviços, tornar o atendimento mais rápido e direcionar mensagens relevantes ao cidadão.',
      },
    ],
  },
  {
    id: 'prazo-atendimento',
    title: 'Prazo e Atendimento',
    items: [
      {
        title: 'Qual o prazo de resposta para os serviços solicitados?',
        content:
          'O tempo de resposta depende de cada serviço, mas todos os prazos estarão informados dentro do portal, garantindo transparência e previsibilidade.',
      },
      {
        title: 'O portal substituirá o 1746 telefônico?',
        content:
          'Não. O telefone 1746 continuará funcionando. O portal será uma alternativa digital mais ágil e inteligente.',
      },
      {
        title: 'E se eu tiver dificuldade em usar o portal?',
        content:
          'Haverá tutoriais, vídeos explicativos e canais de suporte para orientar os cidadãos no uso da nova plataforma.',
      },
    ],
  },
  {
    id: 'futuro-expansao',
    title: 'Futuro e Expansão',
    items: [
      {
        title: 'Quando o portal terá todos os serviços concentrados?',
        content:
          'A previsão é que a integração completa aconteça de forma progressiva até o fim de 2026.',
      },
      {
        title: 'Quais as vantagens de usar o portal em vez de outros canais?',
        content: [
          'Centralização de tudo o que o cidadão precisa em um só lugar',
          'Aplicativo personalizado',
          'Agilidade e clareza nas informações',
          'Redução de burocracia',
          'Maior transparência e confiabilidade',
        ],
      },
    ],
  },
]

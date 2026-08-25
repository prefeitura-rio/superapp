import {
  LegalDivider,
  LegalDocument,
  legalBodyCn,
  legalTitleCn,
} from '@/app/components/legal/legal-document'
import Link from 'next/link'

export function TermosDeUsoContent() {
  return (
    <LegalDocument
      title="Termos de uso"
      lastUpdate="Abril de 2026 - Versão 1.0"
    >
      <div className="space-y-4">
        <h2 className={legalTitleCn}>1. DA CIÊNCIA DO TERMO DE USO:</h2>
        <p className={legalBodyCn}>
          O presente Termo de Uso se refere a um instrumento firmado entre o
          usuário e o fornecedor deste serviço, a Secretaria Municipal da Casa
          Civil (CVL), localizada na Rua Afonso Cavalcanti, 455/ 13º andar -
          Cidade Nova – Rio de Janeiro/RJ.
        </p>
        <p className={legalBodyCn}>
          O uso deste serviço está condicionado à ciência dos termos e do Aviso
          de Privacidade associados. O usuário deverá ler tais termos e o Aviso,
          certificar-se de havê-los entendido, estar consciente de todas as
          condições estabelecidas no Termo de Uso e se comprometer a cumpri-las.
        </p>
        <p className={legalBodyCn}>
          Ao utilizar o serviço, o usuário manifesta estar ciente em relação ao
          conteúdo deste Termo de Uso e estará legalmente vinculado a todas as
          condições aqui previstas.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>2. DEFINIÇÕES DO TERMO DE USO:</h2>
        <p className={legalBodyCn}>
          Para os fins deste Termo de Uso, são aplicáveis as seguintes
          definições:
        </p>
        <ul className="space-y-3">
          {[
            {
              letter: 'a',
              text: 'Agente público: Todo aquele que exerce, ainda que transitoriamente ou sem remuneração, por eleição, nomeação, designação, contratação ou qualquer outra forma de investidura ou vínculo, mandato, cargo, emprego ou função nos órgãos e entidades da Administração Pública, direta ou indireta.',
            },
            {
              letter: 'b',
              text: 'Agentes de Estado: Inclui órgãos e entidades da Administração Pública além dos seus agentes públicos.',
            },
            {
              letter: 'c',
              text: 'Códigos maliciosos: São qualquer programa de computador, ou parte de um programa, construído com a intenção de provocar danos, obter informações não autorizadas ou interromper o funcionamento de sistemas e/ou redes de computadores.',
            },
            {
              letter: 'd',
              text: 'Sítios e aplicativos: Sítios e aplicativos por meio dos quais o usuário acessa os serviços e conteúdos disponibilizados.',
            },
            {
              letter: 'e',
              text: 'Terceiro: Pessoa ou entidade que não participa diretamente em um contrato, em um ato jurídico ou em um negócio, ou que, para além das partes envolvidas, pode ter interesse num processo jurídico.',
            },
            {
              letter: 'f',
              text: 'Internet: Sistema constituído do conjunto de protocolos lógicos, estruturado em escala mundial para uso público e irrestrito, com a finalidade de possibilitar a comunicação de dados entre terminais por meio de diferentes redes.',
            },
            {
              letter: 'g',
              text: 'Usuários: Todas as pessoas naturais que utilizarem os serviços ofertados na Plataforma Pref.Rio.',
            },
          ].map(item => (
            <li key={item.letter} className={legalBodyCn}>
              <span className="font-medium">{item.letter})</span> {item.text}
            </li>
          ))}
        </ul>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>3. ARCABOUÇO LEGAL:</h2>
        <p className={legalBodyCn}>
          O arcabouço legal aplicável à Plataforma Pref.Rio compreende os
          seguintes atos legislativos e normativos:
        </p>
        <ul className="space-y-3">
          {[
            {
              letter: 'a',
              text: 'Lei nº 12.965, de 23 de abril de 2014 – Marco Civil da Internet – Estabelece princípios, garantias, direitos e deveres para o uso da Internet no Brasil;',
            },
            {
              letter: 'b',
              text: 'Lei nº 12.527, de 18 de novembro de 2011 – Lei de Acesso à Informação – Regula o acesso a informações previsto na Constituição Federal;',
            },
            {
              letter: 'c',
              text: 'Lei nº 13.460, de 26 de junho de 2017 – Dispõe sobre participação, proteção e defesa dos direitos do usuário dos serviços da administração pública;',
            },
            {
              letter: 'd',
              text: 'Lei nº 13.709, de 14 de agosto de 2018 – Dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou por pessoa jurídica de direito público ou privado, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa natural;',
            },
            {
              letter: 'e',
              text: 'Lei nº 14.129, de 29 de março de 2021 – Princípios, regras e instrumentos para o Governo Digital;',
            },
            {
              letter: 'f',
              text: 'Lei nº 12.737, de 30 de novembro de 2012 – Dispõe sobre a tipificação criminal de delitos informáticos;',
            },
            {
              letter: 'g',
              text: 'DECRETO RIO nº 49.558, de 06 de outubro de 2021 – Estabelece o Programa Municipal de Proteção de Dados no âmbito do Poder Executivo Municipal da Prefeitura da Cidade do Rio de Janeiro;',
            },
            {
              letter: 'h',
              text: 'DECRETO RIO nº 53.700, de 8 de dezembro de 2023 – Institui a Política de Segurança da Informação - PSI no âmbito do Poder Executivo Municipal, e dá outras providências;',
            },
            {
              letter: 'i',
              text: 'Resolução CVL nº 216, de 15 de dezembro de 2023 – Regulamenta as diretrizes da Política de Segurança da Informação - PSI no âmbito do Poder Executivo Municipal;',
            },
            {
              letter: 'j',
              text: 'Resolução SEGOVI nº 91, de 1º de agosto de 2022 – Regulamenta o Programa de Governança em Privacidade e Proteção dos Dados Pessoais - PGPPDP;',
            },
          ].map(item => (
            <li key={item.letter} className={legalBodyCn}>
              <span className="font-medium">{item.letter})</span> {item.text}
            </li>
          ))}
        </ul>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>4. DESCRIÇÃO DO SERVIÇO:</h2>
        {[
          '4.1 Nome do Serviço: Plataforma Pref.Rio.',
          '4.2 Nome do órgão ou da entidade municipal responsável pelo serviço: Secretaria Municipal da Casa Civil (CVL).',
          '4.3 Descrição do serviço e objetivos do serviço: A Plataforma Pref.Rio é a carta de serviços da Prefeitura do Rio. Ela permite que os cidadãos (usuários) façam solicitações de serviço e tenham acesso à informação, além de possibilitar a abertura de reclamações, denúncias, elogios e sugestões à Ouvidoria da Prefeitura do Rio de Janeiro. Além disso, oferece uma plataforma digital integrada de gerenciamento, inscrições e informações voltadas à formação profissional, geração de emprego e renda, o Oportunidades Cariocas.',
        ].map((text, i) => (
          <p key={i} className={legalBodyCn}>
            {text}
          </p>
        ))}
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>5. DIREITOS DO USUÁRIO DO SERVIÇO:</h2>
        <p className={legalBodyCn}>
          De acordo com a Lei nº 13.460, de 26 de junho de 2017, são direitos
          básicos do usuário:
        </p>
        <ul className="space-y-3">
          {[
            '5.1. Participação no acompanhamento da prestação e na avaliação dos serviços;',
            '5.2. Obtenção e utilização dos serviços com liberdade de escolha entre os meios oferecidos e sem discriminação;',
            '5.3. Acesso e obtenção de informações relativas à sua pessoa constantes de registros ou bancos de dados, observado o disposto no inciso X do caput do art. 5º da Constituição Federal e na Lei nº 12.527, de 18 de novembro de 2011;',
            '5.4. Proteção de suas informações pessoais, nos termos da Lei nº 12.527, de 18 de novembro de 2011;',
            '5.5. Atuação integrada e sistêmica na expedição de atestados, certidões e documentos comprobatórios de regularidade;',
          ].map((text, i) => (
            <p key={i} className={legalBodyCn}>
              {text}
            </p>
          ))}
        </ul>
        <p className={legalBodyCn}>
          5.6. Obtenção de informações precisas e de fácil acesso nos locais de
          prestação do serviço, assim como sua disponibilização na internet,
          especialmente sobre:
        </p>
        <ul className="space-y-2 pl-4">
          {[
            'a) Acesso ao agente público ou ao órgão encarregado de receber manifestações;',
            'b) Valor das taxas e tarifas cobradas pela prestação dos serviços, contendo informações para a compreensão exata da extensão do serviço prestado;',
            'c) Situação da tramitação dos processos administrativos em que figure como interessado.',
          ].map((text, i) => (
            <li key={i} className={legalBodyCn}>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>6. RESPONSABILIDADES DO USUÁRIO:</h2>
        {[
          '6.1. O usuário se responsabiliza pela precisão e pela veracidade dos dados informados e reconhece que a inconsistência deles poderá implicar a impossibilidade de se utilizar o serviço da Plataforma Pref.Rio.',
          '6.2. Durante a utilização do serviço, a fim de resguardar e proteger os direitos de terceiros, o usuário se compromete a fornecer somente seus dados pessoais, e não os de terceiros.',
          '6.3. O login e senha só poderão ser utilizados pelo usuário cadastrado. Ele se compromete em manter o sigilo da senha, que é pessoal e intransferível, não sendo possível, em qualquer hipótese, a alegação de uso indevido após o ato de compartilhamento.',
          '6.4. O usuário do serviço é responsável pela atualização dos seus dados pessoais e pelas consequências em caso de omissão ou erros nos dados fornecidos.',
          '6.5. O usuário é responsável pela reparação de todos e quaisquer danos, diretos ou indiretos (inclusive decorrentes de violação de quaisquer direitos de outros usuários; de terceiros, inclusive direitos de propriedade intelectual; de sigilo; e de personalidade), que sejam causados à Administração Pública, a qualquer outro usuário, ou ainda a qualquer terceiro, inclusive em virtude do descumprimento do disposto nestes Termos de Uso e Aviso de Privacidade ou de qualquer ato praticado a partir de seu acesso ao serviço.',
        ].map((text, i) => (
          <p key={i} className={legalBodyCn}>
            {text}
          </p>
        ))}
        <p className={legalBodyCn}>
          6.6. A Administração Pública Municipal do Rio de Janeiro não poderá
          ser responsabilizada pelos seguintes fatos:
        </p>
        <ul className="space-y-2 pl-4">
          {[
            'a) Equipamento infectado ou invadido por atacantes;',
            'b) Equipamento avariado no momento do consumo de serviços;',
            'c) Proteção do computador;',
            'd) Proteção das informações baseadas nos computadores dos usuários;',
            'e) Abuso de uso dos computadores dos usuários;',
            'f) Monitoração clandestina do computador dos usuários;',
            'g) Vulnerabilidades ou instabilidades existentes nos sistemas dos usuários;',
            'h) Perímetro inseguro;',
            'i) Uso de dispositivos eletrônicos que não sejam de propriedade da Instituição.',
          ].map((text, i) => (
            <li key={i} className={legalBodyCn}>
              {text}
            </li>
          ))}
        </ul>
        <p className={legalBodyCn}>
          6.7. Em nenhuma hipótese, a Administração Pública Municipal do Rio de
          Janeiro será responsável pela instalação, no equipamento do usuário ou
          de terceiros, de códigos maliciosos (vírus, trojans, malware, worm,
          bot, backdoor, spyware, rootkit, ou de quaisquer outros que venham a
          ser criados), em decorrência da navegação na Internet pelo usuário.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>
          7. RESPONSABILIDADE DA ADMINISTRAÇÃO PÚBLICA:
        </h2>
        <p className={legalBodyCn}>
          7.1 A Administração Pública Municipal se compromete a cumprir todas as
          legislações inerentes ao uso correto dos dados pessoais do cidadão de
          forma a preservar a privacidade dos dados utilizados no serviço, bem
          como a garantir todos os direitos e garantias legais dos titulares dos
          dados. Ela também se obriga a promover, independentemente de
          requerimentos, a divulgação em local de fácil acesso, no âmbito de
          suas competências, de informações de interesse coletivo ou geral por
          eles produzidas ou custodiadas. É de responsabilidade da Administração
          Pública Municipal implementar controles de segurança para proteção dos
          dados pessoais dos titulares.
        </p>
        <p className={legalBodyCn}>
          7.2 A Administração Pública Municipal poderá, quanto às ordens
          judiciais de pedido das informações, compartilhar informações
          necessárias para investigações ou tomar medidas relacionadas a
          atividades ilegais, suspeitas de fraude ou ameaças potenciais contra
          pessoas, bens ou sistemas que sustentam o serviço ou de outra forma
          necessárias para cumprir com obrigações legais. Caso ocorra, a
          Administração Pública Municipal notificará os titulares dos dados,
          salvo quando o processo estiver em segredo de justiça.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>8. AVISO DE PRIVACIDADE:</h2>
        <p className={legalBodyCn}>
          O Aviso de Privacidade estabelecido pela Secretaria Municipal da Casa
          Civil (CVL) e utilizado pela Plataforma Pref.Rio trata da utilização
          de dados pessoais.
        </p>
        <p className={legalBodyCn}>
          Esse Aviso faz parte de forma inerente do presente Termo de Uso,
          ressaltando-se que os dados pessoais mencionados por esse serviço
          serão tratados nos termos da legislação em vigor.
        </p>
        <p className={legalBodyCn}>
          Para mais informações, acesse nosso{' '}
          <Link href="/politica-de-privacidade" className="underline">
            Aviso de Privacidade
          </Link>
          .
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>9. INFORMAÇÕES PARA CONTATO:</h2>
        <p className={legalBodyCn}>
          Em caso de dúvidas relacionadas à Plataforma Pref.Rio, entre em
          contato através dos nossos canais de atendimento:
        </p>
        <ul className="space-y-2 pl-4">
          {[
            'a) E-mail: central1746@prefeitura.rio ou oportunidades.cariocas@prefeitura.rio;',
            'b) Telefone: 1746 ou (21) 3460-1746;',
            'c) Portal: pref.rio',
            'd) Atendimento presencial: Agência 1746 - Rua Afonso Cavalcanti, 455 - térreo, Cidade Nova (Centro Administrativo São Sebastião); Atendimento presencial itinerante através do 1746 Na Pista (Van).',
          ].map((text, i) => (
            <li key={i} className={legalBodyCn}>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </LegalDocument>
  )
}

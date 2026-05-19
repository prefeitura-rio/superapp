'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import Link from 'next/link'

const titleCn =
  "text-[color:var(--theme-color-card-foreground,#020618)] font-[family-name:var(--font-family-sans,'DM_Sans')] text-[length:var(--font-size-lg,18px)] font-[var(--font-weight-medium,500)] leading-[var(--font-leading-5,20px)] tracking-[var(--font-tracking-normal,0)]"

const bodyCn =
  "text-[color:var(--theme-color-foreground-light,#71717B)] font-[family-name:var(--font-family-sans,'DM_Sans')] text-[length:var(--font-size-sm,14px)] font-[var(--font-weight-normal,400)] leading-[var(--font-leading-5,20px)] tracking-[var(--font-tracking-normal,0)]"

function Divider() {
  return <hr className="border-border my-6" />
}

export function TermosDeUsoContent() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader
        fixed={false}
        title="Termos de Uso"
        route="/servicos/trabalho/menu"
      />

      <div className="px-4 pt-6">
        {/* I. TERMO DE USO */}
        <div>
          <h1 className={titleCn}>I. TERMO DE USO - PLATAFORMA PREF.RIO</h1>
          <p className={`${bodyCn} mt-1`}>Abril de 2026 - Versão 1.0</p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>1. DA CIÊNCIA DO TERMO DE USO:</h2>
          <p className={bodyCn}>
            O presente Termo de Uso se refere a um instrumento firmado entre o
            usuário e o fornecedor deste serviço, a Secretaria Municipal da Casa
            Civil (CVL), localizada na Rua Afonso Cavalcanti, 455/ 13º andar -
            Cidade Nova – Rio de Janeiro/RJ.
          </p>
          <p className={bodyCn}>
            O uso deste serviço está condicionado à ciência dos termos e do
            Aviso de Privacidade associados. O usuário deverá ler tais termos e
            o Aviso, certificar-se de havê-los entendido, estar consciente de
            todas as condições estabelecidas no Termo de Uso e se comprometer a
            cumpri-las.
          </p>
          <p className={bodyCn}>
            Ao utilizar o serviço, o usuário manifesta estar ciente em relação
            ao conteúdo deste Termo de Uso e estará legalmente vinculado a todas
            as condições aqui previstas.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>2. DEFINIÇÕES DO TERMO DE USO:</h2>
          <p className={bodyCn}>
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
              <li key={item.letter} className={bodyCn}>
                <span className="font-medium">{item.letter})</span> {item.text}
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>3. ARCABOUÇO LEGAL:</h2>
          <p className={bodyCn}>
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
              <li key={item.letter} className={bodyCn}>
                <span className="font-medium">{item.letter})</span> {item.text}
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>4. DESCRIÇÃO DO SERVIÇO:</h2>
          {[
            '4.1 Nome do Serviço: Plataforma Pref.Rio.',
            '4.2 Nome do órgão ou da entidade municipal responsável pelo serviço: Secretaria Municipal da Casa Civil (CVL).',
            '4.3 Descrição do serviço e objetivos do serviço: A Plataforma Pref.Rio é a carta de serviços da Prefeitura do Rio. Ela permite que os cidadãos (usuários) façam solicitações de serviço e tenham acesso à informação, além de possibilitar a abertura de reclamações, denúncias, elogios e sugestões à Ouvidoria da Prefeitura do Rio de Janeiro. Além disso, oferece uma plataforma digital integrada de gerenciamento, inscrições e informações voltadas à formação profissional, geração de emprego e renda, o Oportunidades Cariocas.',
          ].map((text, i) => (
            <p key={i} className={bodyCn}>
              {text}
            </p>
          ))}
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>5. DIREITOS DO USUÁRIO DO SERVIÇO:</h2>
          <p className={bodyCn}>
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
              <p key={i} className={bodyCn}>
                {text}
              </p>
            ))}
          </ul>
          <p className={bodyCn}>
            5.6. Obtenção de informações precisas e de fácil acesso nos locais
            de prestação do serviço, assim como sua disponibilização na
            internet, especialmente sobre:
          </p>
          <ul className="space-y-2 pl-4">
            {[
              'a) Acesso ao agente público ou ao órgão encarregado de receber manifestações;',
              'b) Valor das taxas e tarifas cobradas pela prestação dos serviços, contendo informações para a compreensão exata da extensão do serviço prestado;',
              'c) Situação da tramitação dos processos administrativos em que figure como interessado.',
            ].map((text, i) => (
              <li key={i} className={bodyCn}>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>6. RESPONSABILIDADES DO USUÁRIO:</h2>
          {[
            '6.1. O usuário se responsabiliza pela precisão e pela veracidade dos dados informados e reconhece que a inconsistência deles poderá implicar a impossibilidade de se utilizar o serviço da Plataforma Pref.Rio.',
            '6.2. Durante a utilização do serviço, a fim de resguardar e proteger os direitos de terceiros, o usuário se compromete a fornecer somente seus dados pessoais, e não os de terceiros.',
            '6.3. O login e senha só poderão ser utilizados pelo usuário cadastrado. Ele se compromete em manter o sigilo da senha, que é pessoal e intransferível, não sendo possível, em qualquer hipótese, a alegação de uso indevido após o ato de compartilhamento.',
            '6.4. O usuário do serviço é responsável pela atualização dos seus dados pessoais e pelas consequências em caso de omissão ou erros nos dados fornecidos.',
            '6.5. O usuário é responsável pela reparação de todos e quaisquer danos, diretos ou indiretos (inclusive decorrentes de violação de quaisquer direitos de outros usuários; de terceiros, inclusive direitos de propriedade intelectual; de sigilo; e de personalidade), que sejam causados à Administração Pública, a qualquer outro usuário, ou ainda a qualquer terceiro, inclusive em virtude do descumprimento do disposto nestes Termos de Uso e Aviso de Privacidade ou de qualquer ato praticado a partir de seu acesso ao serviço.',
          ].map((text, i) => (
            <p key={i} className={bodyCn}>
              {text}
            </p>
          ))}
          <p className={bodyCn}>
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
              <li key={i} className={bodyCn}>
                {text}
              </li>
            ))}
          </ul>
          <p className={bodyCn}>
            6.7. Em nenhuma hipótese, a Administração Pública Municipal do Rio
            de Janeiro será responsável pela instalação, no equipamento do
            usuário ou de terceiros, de códigos maliciosos (vírus, trojans,
            malware, worm, bot, backdoor, spyware, rootkit, ou de quaisquer
            outros que venham a ser criados), em decorrência da navegação na
            Internet pelo usuário.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>
            7. RESPONSABILIDADE DA ADMINISTRAÇÃO PÚBLICA:
          </h2>
          <p className={bodyCn}>
            7.1 A Administração Pública Municipal se compromete a cumprir todas
            as legislações inerentes ao uso correto dos dados pessoais do
            cidadão de forma a preservar a privacidade dos dados utilizados no
            serviço, bem como a garantir todos os direitos e garantias legais
            dos titulares dos dados. Ela também se obriga a promover,
            independentemente de requerimentos, a divulgação em local de fácil
            acesso, no âmbito de suas competências, de informações de interesse
            coletivo ou geral por eles produzidas ou custodiadas. É de
            responsabilidade da Administração Pública Municipal implementar
            controles de segurança para proteção dos dados pessoais dos
            titulares.
          </p>
          <p className={bodyCn}>
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

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>8. AVISO DE PRIVACIDADE:</h2>
          <p className={bodyCn}>
            O Aviso de Privacidade estabelecido pela Secretaria Municipal da
            Casa Civil (CVL) e utilizado pela Plataforma Pref.Rio trata da
            utilização de dados pessoais.
          </p>
          <p className={bodyCn}>
            Esse Aviso faz parte de forma inerente do presente Termo de Uso,
            ressaltando-se que os dados pessoais mencionados por esse serviço
            serão tratados nos termos da legislação em vigor.
          </p>
          <p className={bodyCn}>
            Para mais informações, acesse nosso Aviso de Privacidade contido no
            item II deste instrumento.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>9. INFORMAÇÕES PARA CONTATO:</h2>
          <p className={bodyCn}>
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
              <li key={i} className={bodyCn}>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* II. AVISO DE PRIVACIDADE */}
        <Divider />

        <div className="space-y-4">
          <h1 className={titleCn}>
            II. AVISO DE PRIVACIDADE – PLATAFORMA PREF.RIO
          </h1>
          <p className={`${bodyCn} mt-1`}>Abril de 2026 - Versão 1.0</p>
          <p className={bodyCn}>
            Este Aviso de Privacidade foi elaborado em conformidade com o Marco
            Civil da Internet e com a Lei Geral de Proteção de Dados Pessoais.
          </p>
          <p className={bodyCn}>
            A aplicação deste Aviso será pautada pelo dever de boa-fé e pela
            observância dos princípios previstos no art. 6º da LGPD dentre eles,
            o da finalidade, da adequação, da necessidade, do livre acesso, da
            qualidade dos dados, da transparência, da segurança, da prevenção,
            da não discriminação e o da responsabilização e da prestação de
            contas.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>1. DEFINIÇÕES:</h2>
          <p className={bodyCn}>
            Para melhor compreensão deste documento, neste Aviso de Privacidade,
            consideram-se:
          </p>
          <ul className="space-y-3">
            {[
              {
                letter: 'a',
                text: 'Dado Pessoal: Informação relacionada a uma pessoa natural identificada ou identificável;',
              },
              {
                letter: 'b',
                text: 'Titular: Pessoa natural a quem se referem os dados pessoais que são objeto de tratamento;',
              },
              {
                letter: 'c',
                text: 'Dado Pessoal Sensível: Dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural;',
              },
              {
                letter: 'd',
                text: 'Agentes de tratamento: O controlador e o operador. Os indivíduos subordinados ou vinculados, como os funcionários, os servidores públicos ou as equipes de trabalho de um órgão ou de uma entidade, que atuam sob o poder diretivo do agente de tratamento não serão considerados como controladores ou operadores;',
              },
              {
                letter: 'e',
                text: 'Controlador: órgão da Administração Direta ou entidade da Administração Indireta, do Poder Executivo do Município do Rio de Janeiro, a quem compete as principais decisões relativas aos elementos essenciais para o cumprimento da finalidade do tratamento de dados pessoais, bem como a definição da natureza dos dados pessoais tratados e a duração do tratamento;',
              },
              {
                letter: 'f',
                text: 'Controladoria Conjunta: determinação conjunta, comum ou convergente, por dois ou mais controladores, das finalidades e dos elementos essenciais para a realização do tratamento de dados pessoais, por meio de acordo que estabeleça as respectivas responsabilidades quanto ao cumprimento da LGPD;',
              },
              {
                letter: 'g',
                text: 'Operador: Pessoa natural ou jurídica, de direito público ou privado, que realiza o tratamento de dados pessoais em nome do controlador;',
              },
              {
                letter: 'h',
                text: 'Suboperador: contratado pelo operador para auxiliá-lo a realizar o tratamento de dados pessoais em nome do controlador, podendo ser equiparado ao operador perante a LGPD em relação às atividades que foi contratado para executar, no que se refere às responsabilidades;',
              },
              {
                letter: 'i',
                text: 'Encarregado: pessoa indicada, mediante ato formal, pelo controlador e pelo operador, cujas identidade e informações de contato estarão divulgadas publicamente, de forma clara e objetiva, preferencialmente no sítio eletrônico do controlador e do operador, sendo responsável por atuar como canal de comunicação entre o controlador, o operador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados – ANPD;',
              },
              {
                letter: 'j',
                text: 'Anonimização: Utilização de meios técnicos razoáveis e disponíveis no momento do tratamento, por meio dos quais um dado perde a possibilidade de associação, direta ou indireta, a um indivíduo;',
              },
              {
                letter: 'k',
                text: 'Dado Anonimizado: Dado relativo a um titular que não possa ser identificado, considerando a utilização de meios técnicos razoáveis e disponíveis na ocasião de seu tratamento;',
              },
              {
                letter: 'l',
                text: 'Autoridade Nacional: Órgão da administração pública responsável por zelar, implementar e fiscalizar o cumprimento desta Lei em todo o território nacional;',
              },
              {
                letter: 'm',
                text: 'Banco de Dados: Conjunto estruturado de dados pessoais, estabelecido em um ou em vários locais, em suporte eletrônico ou físico;',
              },
              {
                letter: 'n',
                text: 'Consentimento: manifestação livre, informada e inequívoca pela qual o titular concorda com o tratamento de seus dados pessoais para uma finalidade determinada, não sendo a única nem a principal base legal possível para viabilizar o tratamento de dados pessoais;',
              },
              {
                letter: 'o',
                text: 'Incidente de segurança com dados pessoais: qualquer evento adverso confirmado, relacionado à violação na segurança de dados pessoais, tais como acesso não autorizado, acidental ou ilícito que resulte na destruição, perda, alteração, vazamento, ou ainda, qualquer forma de tratamento de dados inadequada ou ilícita, os quais possam ocasionar risco para os direitos e liberdades do titular dos dados pessoais;',
              },
              {
                letter: 'p',
                text: 'Órgão de Pesquisa: Órgão ou entidade da administração pública direta ou indireta ou pessoa jurídica de direito privado sem fins lucrativos, legalmente constituída sob as leis brasileiras e com sede e foro no País, que inclua em sua missão institucional ou em seu objetivo social ou estatutário a pesquisa básica ou aplicada de caráter histórico, científico, tecnológico ou estatístico;',
              },
              {
                letter: 'q',
                text: 'Transferência Internacional de Dados: Transferência de dados pessoais para país estrangeiro ou organismo internacional do qual o país seja membro;',
              },
              {
                letter: 'r',
                text: 'Tratamento: Toda operação realizada com dados pessoais, como as que se referem à coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração; e',
              },
              {
                letter: 's',
                text: 'Uso Compartilhado de Dados: Comunicação, difusão, transferência internacional, interconexão de dados pessoais ou tratamento compartilhado de bancos de dados pessoais por órgãos e entidades públicos no cumprimento de suas competências legais, ou entre esses e entes privados, reciprocamente, com autorização específica, para uma ou mais modalidades de tratamento permitidas por esses entes públicos, ou entre entes privados.',
              },
            ].map(item => (
              <li key={item.letter} className={bodyCn}>
                <span className="font-medium">{item.letter})</span> {item.text}
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>
            2. BASE LEGAL PARA TRATAMENTO DE DADOS PESSOAIS:
          </h2>
          <p className={bodyCn}>
            2.1. O tratamento de dados é realizado com base no artigo 7º,
            incisos III e IV da LGPD, e se limitam à execução de políticas
            públicas e, porventura, à realização de estudos de pesquisa.
          </p>
          <p className={bodyCn}>
            2.2. O tratamento de dados pessoais sensíveis é realizado com base
            no art. 11, inciso II, alíneas b) e c), e se limitam ao cumprimento
            das finalidades descritas no item 8 deste Aviso de Privacidade.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>3. CONTROLADOR</h2>
          <p className={bodyCn}>
            Responsável pelas principais decisões sobre o tratamento de dados
            pessoais.
          </p>
          {[
            '3.1. Nome da Controladora: Secretaria Municipal da Casa Civil (CVL).',
            '3.2. Endereço da Controladora: Rua Afonso Cavalcanti, 455 – 13º andar - Cidade Nova – Rio de Janeiro/RJ.',
            '3.3. Endereço eletrônico do Controlador: https://casacivil.prefeitura.rio',
            '3.4. Nome do(a) encarregado(a) de dados do Controlador: Amanda da Costa Coelho Lobato; Suplente: Samir de Menezes Costa.',
            '3.4.1. E-mail do(a) encarregado(a) de dados do Controlador: O usuário poderá entrar em contato por meio do e-mail lgpd.cvl@prefeitura.rio, para sanar quaisquer dúvidas sobre este Aviso de Privacidade ou para obter mais informações sobre o tratamento dos dados realizado com fundamento na LGPD.',
          ].map((text, i) => (
            <p key={i} className={bodyCn}>
              {text}
            </p>
          ))}
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>4. OPERADOR</h2>
          <p className={bodyCn}>
            Pessoa natural ou jurídica, de direito público ou privado, que
            realiza o tratamento de dados pessoais em nome do Controlador.
          </p>
          {[
            '4.1. Nome do Operador: Empresa Municipal de Informática S.A. / IPLANRIO.',
            '4.2. Endereço do Operador: Rua Beatriz Larragoiti Lucas, 121 – 8º andar – Torre Norte – Cidade Nova – Rio de Janeiro/RJ.',
            '4.3. Endereço eletrônico do Operador: https://iplanrio.prefeitura.rio',
            '4.4. Telefone para contato: Tel.: 2088-4925.',
            '4.5. Nome do(a) encarregado(a) de dados do Operador: Antônio Sérgio de Oliveira Luiz.',
            '4.5.1. Contato do encarregado de dados do Operador: O usuário poderá entrar em contato por meio do e-mail encarregados.iplanrio@prefeitura.rio, para sanar quaisquer dúvidas sobre esta Política de Privacidade ou para obter mais informações sobre o tratamento dos dados realizado com fundamento na LGPD.',
            '4.5.2. Contato do encarregado de dados do SubOperador: Empresa Google. O suporte da empresa está detalhado no documento no link a seguir: https://services.google.com/fh/files/misc/pt-br-cloud-data-processing-addendum-customers.pdf',
          ].map((text, i) => (
            <p key={i} className={bodyCn}>
              {text}
            </p>
          ))}
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>5. DIREITOS DO TITULAR DE DADOS PESSOAIS:</h2>
          <p className={bodyCn}>
            5.1. O titular de dados pessoais possui os seguintes direitos,
            conferidos pela Lei Geral de Proteção de Dados Pessoais (LGPD):
          </p>
          <ul className="space-y-3 pl-4">
            {[
              'a) Direito de confirmação e acesso (Art. 18, incisos I e II): é o direito do titular de dados de obter do serviço a confirmação de que os dados pessoais que lhe digam respeito são ou não objeto de tratamento e, se for esse o caso, o direito de acessar os seus dados pessoais;',
              'b) Direito de retificação (Art. 18, inciso III): é o direito de solicitar a correção de dados incompletos, inexatos ou desatualizados;',
              'c) Direito à limitação do tratamento dos dados (Art. 18, inciso IV): é o direito do titular de dados de limitar o tratamento de seus dados pessoais, podendo exigir a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com o disposto na Lei Geral de Proteção de Dados Pessoais;',
              'd) Direito de oposição (Art. 18, § 2º): é o direito do titular de dados de, a qualquer momento, opor-se ao tratamento de dados por motivos relacionados com a sua situação particular, com fundamento em uma das hipóteses de dispensa de consentimento ou em caso de descumprimento ao disposto na Lei Geral de Proteção de Dados Pessoais; e',
              'e) Direito de não ser submetido a decisões automatizadas (Art. 20): o titular dos dados tem direito a solicitar a revisão de decisões tomadas unicamente com base em tratamento automatizado de dados pessoais que afetem seus interesses, incluídas as decisões destinadas a definir o seu perfil pessoal, profissional, de consumo e de crédito ou os aspectos de sua personalidade.',
            ].map((text, i) => (
              <li key={i} className={bodyCn}>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>6. QUAIS DADOS PESSOAIS SÃO TRATADOS:</h2>
          <p className={bodyCn}>
            6.1. A utilização de determinadas funcionalidades do serviço pelo
            titular de dados pessoais dependerá do tratamento dos seguintes
            dados pessoais:
          </p>
          <ul className="space-y-1 pl-4">
            {[
              'a) Nome completo;',
              'b) Nome social;',
              'c) Número de inscrição no CPF;',
              'd) Endereço residencial;',
              'e) Número de telefone; e',
              'f) Endereço de e-mail.',
            ].map((text, i) => (
              <li key={i} className={bodyCn}>
                {text}
              </li>
            ))}
          </ul>
          <p className={bodyCn}>
            6.2. Conforme as diretrizes do órgão ou entidade municipal gestora,
            poderão ser requisitados dados complementares para fins de
            qualificação e atendimento. Tais dados incluem, mas não se limitam
            a: Idade, Raça/Cor, Deficiência (conforme parâmetros de
            acessibilidade), Gênero, Renda Familiar e Escolaridade, para atender
            aos requisitos específicos de inscrição e prestação do serviço
            público selecionado.
          </p>
          <p className={bodyCn}>
            6.3. Tratamento de Dados de Crianças e Adolescentes: Porventura,
            poderá haver o tratamento de dados pessoais de crianças e
            adolescentes.
          </p>
          <p className={bodyCn}>
            6.3.1 O tratamento de dados pessoais de crianças e de adolescentes
            será realizado, sempre, em seu melhor interesse, devendo ser
            observadas as regras constantes do seu art. 14 da LGPD e, na
            hipótese de execução de políticas públicas, dos artigos 23 a 30, da
            referida lei.
          </p>
          <p className={bodyCn}>
            6.4. Tratamento de Dados Pessoais Sensíveis: O serviço realizará
            tratamento de dados pessoais sensíveis na hipótese constante do art.
            11, II, alíneas "b" e "c", da LGPD para as finalidades de inscrição
            e gestão das ações de formação e oportunidades de emprego e renda
            ofertadas pelos órgãos, entidades municipais e/ou instituições
            parceiras, de melhoria da experiência do usuário e de realização de
            estudos e pesquisas que visam a formulação de políticas mais
            assertivas e inclusivas, garantindo a anonimização dos dados sempre
            que possível, conforme detalhado no Aviso.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>7. COMO OS DADOS SÃO COLETADOS:</h2>
          <p className={bodyCn}>
            Os dados pessoais utilizados no serviço são informados pelo usuário
            no momento do registro, para atualização de cadastros e, em alguns
            casos, para execução dos serviços.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>8. TRATAMENTO REALIZADO E FINALIDADE:</h2>
          <p className={bodyCn}>
            8.1. Os dados pessoais utilizados no serviço têm como tratamento, o
            acesso, a avaliação, a coleta, o armazenamento, o processamento e a
            utilização, possuindo como finalidades específicas, a identificação
            do usuário dentro do serviço, a manutenção do usuário logado, o
            atendimento da solicitação, a identificação do usuário para
            inscrições em oportunidades de capacitação e colocação profissional,
            a melhoria e a personalização da experiência do usuário, o
            aprimoramento de políticas públicas, a realização de estudos e
            pesquisas para fins estatísticos e de planejamento e a melhoria da
            prestação dos serviços oferecidos pela Prefeitura da Cidade do Rio
            de Janeiro.
          </p>
          <p className={bodyCn}>
            8.2. Importante destacar que outros dados pessoais poderão ser
            exigidos e tratados, pelos órgãos e entidades municipais prestadores
            dos serviços inseridos na Plataforma Pref.Rio, após a inscrição
            inicial feita pelo usuário. Nesse sentido, cada Agente de Tratamento
            deve providenciar os seus respectivos Termos de Uso e documentações
            pertinentes, relativas ao correto tratamento dos dados pessoais do
            serviço disponibilizado.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>9. COMPARTILHAMENTO DE DADOS:</h2>
          <p className={bodyCn}>
            9.1. Os dados pessoais do usuário poderão ser compartilhados com a
            Controladoria-Geral do Município do Rio de Janeiro (CGM), Tribunal
            de Contas do Município do Rio de Janeiro (TCM), e demais órgãos de
            controles e de fiscalização, como os Ministérios Públicos e as
            Defensorias Públicas.
          </p>
          <p className={bodyCn}>
            9.2. O uso, acesso e compartilhamento da base de dados formada nos
            termos do presente Aviso de Privacidade poderão ser feitos dentro
            dos limites e propósitos das atividades legais da Secretaria
            Municipal da Casa Civil (CVL). As bases poderão ser fornecidas e
            disponibilizadas para acesso e/ou consulta de:
          </p>
          <ul className="space-y-2 pl-4">
            {[
              '9.2.1. Órgãos, entidades da Administração Pública e/ou instituições parceiras ofertantes;',
              '9.2.2. Para execução de serviços públicos ou informações sobre outras políticas públicas;',
              '9.2.3. Para execução e gestão da oferta de ações formativas e/ou oportunidades de emprego e renda cadastradas na plataforma Oportunidades Cariocas.',
              '9.2.4. Investigações judiciais: A Secretaria Municipal da Casa Civil (CVL) poderá, quanto às ordens judiciais de pedido das informações, compartilhar informações necessárias para investigações ou tomar medidas relacionadas a atividades ilegais, suspeitas de fraude ou ameaças potenciais contra pessoas, bens ou sistemas ou de outra forma necessária para cumprir com nossas obrigações legais em caso de determinação judicial.',
              '9.2.5. Tramitação em processos administrativos: Compartilhamento dos dados em processos físicos e digitais: Os dados pessoais tratados pela Administração Pública Municipal poderão ser inseridos em processos físicos ou processos virtuais, neste último caso inseridos no SEI.RIO, para fins de tramitação de expediente administrativo, em cumprimento aos princípios do devido processo legal e da legalidade administrativa, além das obrigações legais constantes da Constituição Federal, da Lei Federal 9.784/99 e do Decreto Municipal 2.477/80, sendo o tratamento de dados pessoais inseridos nos processos administrativo realizados de acordo com a base legal constante do art. 7º, II, da LGPD.',
            ].map((text, i) => (
              <li key={i} className={bodyCn}>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>10. TRANSFERÊNCIA INTERNACIONAL DE DADOS:</h2>
          <p className={bodyCn}>
            Não haverá transferência internacional de dados pessoais.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>11. SEGURANÇA DOS DADOS:</h2>
          <p className={bodyCn}>
            11.1. A Plataforma Pref.Rio aplica a Política de Segurança da
            Informação da Prefeitura, constante do Decreto Rio Nº 53.700 de 8 de
            dezembro de 2023 e da Resolução CVL Nº 216 de 15 de dezembro de
            2023.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>12. COOKIES:</h2>
          {[
            '12.1. Cookies são pequenos arquivos de texto enviados pelo site ao computador do usuário e que nele ficam armazenados, com informações relacionadas à navegação do site.',
            '12.2. Por meio dos cookies, pequenas quantidades de informação são armazenadas pelo navegador do usuário para que o servidor do serviço possa lê-las posteriormente. Podem ser armazenados, por exemplo, dados sobre o dispositivo utilizado pelo usuário, bem como seu local e horário de acesso ao site.',
            '12.3. É importante ressaltar que nem todo cookie contém dados pessoais do usuário, já que determinados tipos de cookies podem ser utilizados somente para que o serviço funcione corretamente.',
            '12.4. As informações eventualmente armazenadas em cookies também são consideradas dados pessoais. Todas as regras previstas neste Aviso de Privacidade também são aplicáveis aos referidos cookies.',
            '12.5. A Plataforma Pref.Rio possui alguns cookies necessários que coletam dados, com base em seu legítimo interesse, tendo em vista a limitação da coleta ao estritamente necessário para a finalidade específica e exclusiva de manter o funcionamento da aplicação. Somente a própria aplicação tem acesso a estes cookies, sendo que as informações e dados coletados não são compartilhados com terceiros e nem cruzadas com outros bancos de dados visando alcançar outras finalidades.',
          ].map((text, i) => (
            <p key={i} className={bodyCn}>
              {text}
            </p>
          ))}
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>
            13. TRATAMENTO POSTERIOR DOS DADOS PARA OUTRAS FINALIDADES:
          </h2>
          <p className={bodyCn}>
            Os dados pessoais do usuário, dentre outros, podem ser utilizados
            para melhoria contínua dos serviços e aprimoramento da experiência
            do usuário no âmbito da Plataforma Pref.Rio.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>14. MUDANÇAS:</h2>
          <p className={bodyCn}>
            14.1. A presente versão 1.0 deste Termo de Uso e deste Aviso de
            Privacidade foi atualizada em abril de 2026.
          </p>
          <p className={bodyCn}>
            14.2. O editor se reserva o direito de modificar no site, a qualquer
            momento, as presentes normas, especialmente para adaptá-las às
            evoluções do serviço da Plataforma Pref.Rio, seja pela
            disponibilização de novas funcionalidades, seja pela supressão ou
            modificação daquelas já existentes.
          </p>
          <p className={bodyCn}>
            14.3. Qualquer alteração e/ou atualização neste instrumento passará
            a vigorar a partir da data de sua publicação no sítio do serviço e
            deverá ser integralmente observada pelos usuários.
          </p>
        </div>

        <Divider />

        <div className="space-y-4">
          <h2 className={titleCn}>15. FORO:</h2>
          <p className={bodyCn}>
            Este Termo de Uso e este Aviso de Privacidade serão regidos pela
            legislação brasileira. Fica eleito o Foro Central da Comarca da
            Capital do Estado do Rio de Janeiro para dirimir quaisquer dúvidas,
            renunciando as partes desde já a qualquer outro, por mais especial
            ou privilegiado que seja.
          </p>
        </div>

        <Divider />

        <div className="flex justify-center pb-6">
          <Link
            href="/servicos/trabalho/curriculo"
            className="flex w-[328px] items-center justify-center gap-(--button-large-spacing,12px) rounded-(--button-small-radius-pill,999px) bg-(--theme-color-primary,#13335A) px-(--button-large-h-padding,24px) py-(--button-large-v-padding,16px) text-white hover:bg-(--theme-color-primary-focused,#2A476A) transition-colors"
          >
            Voltar para a tela anterior
          </Link>
        </div>
      </div>
    </main>
  )
}

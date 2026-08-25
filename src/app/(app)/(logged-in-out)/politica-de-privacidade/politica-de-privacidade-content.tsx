import {
  LegalDivider,
  LegalDocument,
  legalBodyCn,
  legalTitleCn,
} from '@/app/components/legal/legal-document'

export function PoliticaDePrivacidadeContent() {
  return (
    <LegalDocument
      title="Política de Privacidade"
      lastUpdate="Abril de 2026 - Versão 1.0"
    >
      <div className="space-y-4">
        <p className={legalBodyCn}>
          Este Aviso de Privacidade foi elaborado em conformidade com o Marco
          Civil da Internet e com a Lei Geral de Proteção de Dados Pessoais.
        </p>
        <p className={legalBodyCn}>
          A aplicação deste Aviso será pautada pelo dever de boa-fé e pela
          observância dos princípios previstos no art. 6º da LGPD dentre eles, o
          da finalidade, da adequação, da necessidade, do livre acesso, da
          qualidade dos dados, da transparência, da segurança, da prevenção, da
          não discriminação e o da responsabilização e da prestação de contas.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>1. DEFINIÇÕES:</h2>
        <p className={legalBodyCn}>
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
            <li key={item.letter} className={legalBodyCn}>
              <span className="font-medium">{item.letter})</span> {item.text}
            </li>
          ))}
        </ul>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>
          2. BASE LEGAL PARA TRATAMENTO DE DADOS PESSOAIS:
        </h2>
        <p className={legalBodyCn}>
          2.1. O tratamento de dados é realizado com base no artigo 7º, incisos
          III e IV da LGPD, e se limitam à execução de políticas públicas e,
          porventura, à realização de estudos de pesquisa.
        </p>
        <p className={legalBodyCn}>
          2.2. O tratamento de dados pessoais sensíveis é realizado com base no
          art. 11, inciso II, alíneas b) e c), e se limitam ao cumprimento das
          finalidades descritas no item 8 deste Aviso de Privacidade.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>3. CONTROLADOR</h2>
        <p className={legalBodyCn}>
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
          <p key={i} className={legalBodyCn}>
            {text}
          </p>
        ))}
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>4. OPERADOR</h2>
        <p className={legalBodyCn}>
          Pessoa natural ou jurídica, de direito público ou privado, que realiza
          o tratamento de dados pessoais em nome do Controlador.
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
          <p key={i} className={legalBodyCn}>
            {text}
          </p>
        ))}
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>
          5. DIREITOS DO TITULAR DE DADOS PESSOAIS:
        </h2>
        <p className={legalBodyCn}>
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
            <li key={i} className={legalBodyCn}>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>6. QUAIS DADOS PESSOAIS SÃO TRATADOS:</h2>
        <p className={legalBodyCn}>
          6.1. A utilização de determinadas funcionalidades do serviço pelo
          titular de dados pessoais dependerá do tratamento dos seguintes dados
          pessoais:
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
            <li key={i} className={legalBodyCn}>
              {text}
            </li>
          ))}
        </ul>
        <p className={legalBodyCn}>
          6.2. Conforme as diretrizes do órgão ou entidade municipal gestora,
          poderão ser requisitados dados complementares para fins de
          qualificação e atendimento. Tais dados incluem, mas não se limitam a:
          Idade, Raça/Cor, Deficiência (conforme parâmetros de acessibilidade),
          Gênero, Renda Familiar e Escolaridade, para atender aos requisitos
          específicos de inscrição e prestação do serviço público selecionado.
        </p>
        <p className={legalBodyCn}>
          6.3. Tratamento de Dados de Crianças e Adolescentes: Porventura,
          poderá haver o tratamento de dados pessoais de crianças e
          adolescentes.
        </p>
        <p className={legalBodyCn}>
          6.3.1 O tratamento de dados pessoais de crianças e de adolescentes
          será realizado, sempre, em seu melhor interesse, devendo ser
          observadas as regras constantes do seu art. 14 da LGPD e, na hipótese
          de execução de políticas públicas, dos artigos 23 a 30, da referida
          lei.
        </p>
        <p className={legalBodyCn}>
          6.4. Tratamento de Dados Pessoais Sensíveis: O serviço realizará
          tratamento de dados pessoais sensíveis na hipótese constante do art.
          11, II, alíneas "b" e "c", da LGPD para as finalidades de inscrição e
          gestão das ações de formação e oportunidades de emprego e renda
          ofertadas pelos órgãos, entidades municipais e/ou instituições
          parceiras, de melhoria da experiência do usuário e de realização de
          estudos e pesquisas que visam a formulação de políticas mais
          assertivas e inclusivas, garantindo a anonimização dos dados sempre
          que possível, conforme detalhado no Aviso.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>7. COMO OS DADOS SÃO COLETADOS:</h2>
        <p className={legalBodyCn}>
          Os dados pessoais utilizados no serviço são informados pelo usuário no
          momento do registro, para atualização de cadastros e, em alguns casos,
          para execução dos serviços.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>8. TRATAMENTO REALIZADO E FINALIDADE:</h2>
        <p className={legalBodyCn}>
          8.1. Os dados pessoais utilizados no serviço têm como tratamento, o
          acesso, a avaliação, a coleta, o armazenamento, o processamento e a
          utilização, possuindo como finalidades específicas, a identificação do
          usuário dentro do serviço, a manutenção do usuário logado, o
          atendimento da solicitação, a identificação do usuário para inscrições
          em oportunidades de capacitação e colocação profissional, a melhoria e
          a personalização da experiência do usuário, o aprimoramento de
          políticas públicas, a realização de estudos e pesquisas para fins
          estatísticos e de planejamento e a melhoria da prestação dos serviços
          oferecidos pela Prefeitura da Cidade do Rio de Janeiro.
        </p>
        <p className={legalBodyCn}>
          8.2. Importante destacar que outros dados pessoais poderão ser
          exigidos e tratados, pelos órgãos e entidades municipais prestadores
          dos serviços inseridos na Plataforma Pref.Rio, após a inscrição
          inicial feita pelo usuário. Nesse sentido, cada Agente de Tratamento
          deve providenciar os seus respectivos Termos de Uso e documentações
          pertinentes, relativas ao correto tratamento dos dados pessoais do
          serviço disponibilizado.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>9. COMPARTILHAMENTO DE DADOS:</h2>
        <p className={legalBodyCn}>
          9.1. Os dados pessoais do usuário poderão ser compartilhados com a
          Controladoria-Geral do Município do Rio de Janeiro (CGM), Tribunal de
          Contas do Município do Rio de Janeiro (TCM), e demais órgãos de
          controles e de fiscalização, como os Ministérios Públicos e as
          Defensorias Públicas.
        </p>
        <p className={legalBodyCn}>
          9.2. O uso, acesso e compartilhamento da base de dados formada nos
          termos do presente Aviso de Privacidade poderão ser feitos dentro dos
          limites e propósitos das atividades legais da Secretaria Municipal da
          Casa Civil (CVL). As bases poderão ser fornecidas e disponibilizadas
          para acesso e/ou consulta de:
        </p>
        <ul className="space-y-2 pl-4">
          {[
            '9.2.1. Órgãos, entidades da Administração Pública e/ou instituições parceiras ofertantes;',
            '9.2.2. Para execução de serviços públicos ou informações sobre outras políticas públicas;',
            '9.2.3. Para execução e gestão da oferta de ações formativas e/ou oportunidades de emprego e renda cadastradas na plataforma Oportunidades Cariocas.',
            '9.2.4. Investigações judiciais: A Secretaria Municipal da Casa Civil (CVL) poderá, quanto às ordens judiciais de pedido das informações, compartilhar informações necessárias para investigações ou tomar medidas relacionadas a atividades ilegais, suspeitas de fraude ou ameaças potenciais contra pessoas, bens ou sistemas ou de outra forma necessária para cumprir com nossas obrigações legais em caso de determinação judicial.',
            '9.2.5. Tramitação em processos administrativos: Compartilhamento dos dados em processos físicos e digitais: Os dados pessoais tratados pela Administração Pública Municipal poderão ser inseridos em processos físicos ou processos virtuais, neste último caso inseridos no SEI.RIO, para fins de tramitação de expediente administrativo, em cumprimento aos princípios do devido processo legal e da legalidade administrativa, além das obrigações legais constantes da Constituição Federal, da Lei Federal 9.784/99 e do Decreto Municipal 2.477/80, sendo o tratamento de dados pessoais inseridos nos processos administrativo realizados de acordo com a base legal constante do art. 7º, II, da LGPD.',
          ].map((text, i) => (
            <li key={i} className={legalBodyCn}>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>
          10. TRANSFERÊNCIA INTERNACIONAL DE DADOS:
        </h2>
        <p className={legalBodyCn}>
          Não haverá transferência internacional de dados pessoais.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>11. SEGURANÇA DOS DADOS:</h2>
        <p className={legalBodyCn}>
          11.1. A Plataforma Pref.Rio aplica a Política de Segurança da
          Informação da Prefeitura, constante do Decreto Rio Nº 53.700 de 8 de
          dezembro de 2023 e da Resolução CVL Nº 216 de 15 de dezembro de 2023.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>12. COOKIES:</h2>
        {[
          '12.1. Cookies são pequenos arquivos de texto enviados pelo site ao computador do usuário e que nele ficam armazenados, com informações relacionadas à navegação do site.',
          '12.2. Por meio dos cookies, pequenas quantidades de informação são armazenadas pelo navegador do usuário para que o servidor do serviço possa lê-las posteriormente. Podem ser armazenados, por exemplo, dados sobre o dispositivo utilizado pelo usuário, bem como seu local e horário de acesso ao site.',
          '12.3. É importante ressaltar que nem todo cookie contém dados pessoais do usuário, já que determinados tipos de cookies podem ser utilizados somente para que o serviço funcione corretamente.',
          '12.4. As informações eventualmente armazenadas em cookies também são consideradas dados pessoais. Todas as regras previstas neste Aviso de Privacidade também são aplicáveis aos referidos cookies.',
          '12.5. A Plataforma Pref.Rio possui alguns cookies necessários que coletam dados, com base em seu legítimo interesse, tendo em vista a limitação da coleta ao estritamente necessário para a finalidade específica e exclusiva de manter o funcionamento da aplicação. Somente a própria aplicação tem acesso a estes cookies, sendo que as informações e dados coletados não são compartilhados com terceiros e nem cruzadas com outros bancos de dados visando alcançar outras finalidades.',
        ].map((text, i) => (
          <p key={i} className={legalBodyCn}>
            {text}
          </p>
        ))}
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>
          13. TRATAMENTO POSTERIOR DOS DADOS PARA OUTRAS FINALIDADES:
        </h2>
        <p className={legalBodyCn}>
          Os dados pessoais do usuário, dentre outros, podem ser utilizados para
          melhoria contínua dos serviços e aprimoramento da experiência do
          usuário no âmbito da Plataforma Pref.Rio.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>14. MUDANÇAS:</h2>
        <p className={legalBodyCn}>
          14.1. A presente versão 1.0 deste Termo de Uso e deste Aviso de
          Privacidade foi atualizada em abril de 2026.
        </p>
        <p className={legalBodyCn}>
          14.2. O editor se reserva o direito de modificar no site, a qualquer
          momento, as presentes normas, especialmente para adaptá-las às
          evoluções do serviço da Plataforma Pref.Rio, seja pela
          disponibilização de novas funcionalidades, seja pela supressão ou
          modificação daquelas já existentes.
        </p>
        <p className={legalBodyCn}>
          14.3. Qualquer alteração e/ou atualização neste instrumento passará a
          vigorar a partir da data de sua publicação no sítio do serviço e
          deverá ser integralmente observada pelos usuários.
        </p>
      </div>

      <LegalDivider />

      <div className="space-y-4">
        <h2 className={legalTitleCn}>15. FORO:</h2>
        <p className={legalBodyCn}>
          Este Termo de Uso e este Aviso de Privacidade serão regidos pela
          legislação brasileira. Fica eleito o Foro Central da Comarca da
          Capital do Estado do Rio de Janeiro para dirimir quaisquer dúvidas,
          renunciando as partes desde já a qualquer outro, por mais especial ou
          privilegiado que seja.
        </p>
      </div>
    </LegalDocument>
  )
}

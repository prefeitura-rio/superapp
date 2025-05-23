'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyNotice() {
  return (
    <div className="relative min-h-svh bg-background text-white flex justify-center">
      <div className="w-full max-w-md">
        {/* Fixed header */}
        <div className="max-w-md mx-auto fixed top-0 left-0 right-0 z-10 bg-background px-4 py-10  flex items-center justify-center">
          <div className="absolute left-4">
            <Link href="/">
              <ArrowLeft className="h-7 w-7 text-white cursor-pointer" />
            </Link>
          </div>
          <h1 className="text-white font-semibold text-base text-center">
            Aviso de privacidade
          </h1>
        </div>

        {/* Scrollable content */}
        <div className="pt-30 pb-8 mb-10 px-4 space-y-4 text-sm text-gray-300 overflow-y-auto h-full">
          <p>
            <span className="text-blue-400 font-semibold">
              Sua privacidade é prioridade para a Prefeitura do Rio de Janeiro.
            </span>
          </p>
          <p>
            Ao compartilhar seus dados conosco, você pode ter a certeza de que
            eles serão protegidos com responsabilidade, em total conformidade
            com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 –
            LGPD) e demais normas aplicáveis.
          </p>
          <p>
            Esses dados serão utilizados exclusivamente para oferecer os
            serviços públicos municipais que você acessa. Salvo em casos
            específicos previstos em lei, os dados serão armazenados por pelo
            menos 5 (cinco) anos a partir da data da coleta.
          </p>
          <p>
            Todas as informações ficam armazenadas em bancos de dados da
            Prefeitura do Rio e podem ser acessadas apenas por órgãos e
            entidades municipais diretamente envolvidos com os serviços
            prestados, sempre de acordo com a legislação vigente.
          </p>
          <p>
            Se tiver dúvidas, sugestões ou quiser registrar uma manifestação,
            você pode entrar em contato nos seguintes canais:
          </p>
          <ul className="list-none space-y-1">
            <li>📱 WhatsApp: (21) 3460-1746</li>
            <li>☎️ Telefone: 1746 (Central de Atendimento da Prefeitura)</li>
            <li>🌐 Online: www.1746.rio</li>
            <li>✉️ E-mail: ouvidoria@rio.rj.gov.br</li>
          </ul>
          <p>
            Para mais informações{' '}
            <Link href="#" className="text-blue-400 underline">
              clique aqui
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

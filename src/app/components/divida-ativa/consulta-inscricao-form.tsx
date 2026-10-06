'use client'

import { MODOS_CONSULTA } from '@/app/components/divida-ativa/modos-consulta'
import { SearchIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import {
  formatarInscricaoImobiliaria,
  isInscricaoImobiliariaValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ConsultaInscricaoFormProps {
  /**
   * Imóveis cadastrados pelo cidadão, vindos do DAL no Server Component pai.
   *
   * Lista vazia é válida — o cidadão pode não ter nenhum imóvel em "Meus Imóveis"
   * e ainda assim digitar a inscrição manualmente. Nesse caso a seção de seleção
   * simplesmente não aparece.
   */
  imoveis: ImovelDividaAtiva[]
}

const modo = MODOS_CONSULTA.inscricao

/**
 * Campo de consulta por inscrição imobiliária com seleção de imóvel salvo.
 *
 * Dois caminhos para o mesmo destino:
 *
 * 1. **Digitação manual**: campo com máscara, validação de formato e "Continuar".
 *    Igual ao `ConsultaParcelamentoForm` genérico, mas restrito à inscrição.
 *
 * 2. **Seleção de imóvel salvo**: lista de "Meus Imóveis" filtrável por endereço ou
 *    bairro. Clicar num card preenche o campo E navega imediatamente — não é necessário
 *    clicar em "Continuar" depois, porque a inscrição já está confirmada visualmente.
 *
 * A busca é client-side: a lista de imóveis chega inteira do servidor (são poucos
 * registros por CPF) e o filtro é só `string.includes`. Não há chamada extra à API.
 *
 * Client Component: toda a interatividade (máscara, filtro, seleção) precisa de estado.
 */
export function ConsultaInscricaoForm({ imoveis }: ConsultaInscricaoFormProps) {
  const router = useRouter()
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  // Filtra por endereço (case-insensitive). Bairro vem dentro do campo `endereco` hoje
  // (premissa P22), então uma busca só já cobre os dois.
  const imoveisFiltrados = busca.trim()
    ? imoveis.filter(im =>
        im.endereco?.toLowerCase().includes(busca.trim().toLowerCase())
      )
    : imoveis

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValor(formatarInscricaoImobiliaria(event.target.value))
    if (erro) setErro(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const digitos = somenteDigitos(valor)

    if (digitos === '') {
      setErro(modo.mensagemVazio)
      return
    }

    if (!isInscricaoImobiliariaValida(valor)) {
      setErro(modo.mensagemFormato)
      return
    }

    router.push(`/divida-ativa/parcelamento/debitos?inscricao=${digitos}`)
  }

  /** Selecionar um imóvel da lista navega direto, sem precisar clicar em "Continuar". */
  function selecionarImovel(imovel: ImovelDividaAtiva) {
    router.push(
      `/divida-ativa/parcelamento/debitos?inscricao=${imovel.inscricao}`
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col gap-6 px-4"
      noValidate
    >
      {/* ── Campo manual ── */}
      <CustomInput
        id="consulta-inscricao"
        label={modo.rotuloCampo}
        placeholder="Escreva aqui"
        inputMode="numeric"
        autoComplete="off"
        value={valor}
        onChange={handleChange}
        error={erro ?? undefined}
      />

      {/* ── Lista de imóveis salvos (só aparece se houver imóveis cadastrados) ── */}
      {imoveis.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-normal text-primary">
            Selecione um imóvel
          </p>

          {/* Campo de busca — pílula cinza sem borda, como no Figma. Não usa o
              `CustomInput` porque ele é transparente com borda até receber foco; aqui o
              fundo cinza fica fixo, com ou sem foco. */}
          <div className="flex h-14 items-center gap-3 rounded-full bg-card px-4 transition-shadow focus-within:ring-1 focus-within:ring-ring/30">
            <SearchIcon
              className="size-7 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              id="busca-imovel"
              type="text"
              aria-label="Busque por endereço ou bairro"
              placeholder="Busque por endereço ou bairro..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              autoComplete="off"
              className="min-w-0 flex-1 truncate border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Cards de imóveis */}
          <ul className="flex flex-col gap-3">
            {imoveisFiltrados.map(imovel => (
              <li key={imovel.inscricao}>
                <button
                  type="button"
                  onClick={() => selecionarImovel(imovel)}
                  className="w-full rounded-2xl bg-card p-4 text-left transition-colors hover:bg-secondary active:bg-secondary"
                >
                  <dl className="flex flex-col gap-4">
                    {imovel.endereco && (
                      <div>
                        <dt className="text-sm font-normal leading-5 text-foreground-light">
                          Endereço
                        </dt>
                        <dd className="text-base font-normal leading-6 text-foreground">
                          {imovel.endereco}
                        </dd>
                        {imovel.bairro && (
                          <dd className="text-base font-normal leading-6 text-foreground">
                            {imovel.bairro}
                          </dd>
                        )}
                      </div>
                    )}

                    <div>
                      <dt className="text-sm font-normal leading-5 text-foreground-light">
                        Inscrição imobiliária
                      </dt>
                      <dd className="text-sm font-normal leading-5 text-foreground">
                        {formatarInscricaoImobiliaria(imovel.inscricao)}
                      </dd>
                    </div>
                  </dl>
                </button>
              </li>
            ))}

            {imoveisFiltrados.length === 0 && (
              <li className="px-1 py-2 text-sm text-foreground-light">
                Nenhum imóvel encontrado para "{busca}".
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-6">
        <CustomButton type="submit" variant="secondary" size="lg" fullWidth>
          Continuar
        </CustomButton>
      </div>
    </form>
  )
}

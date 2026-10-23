'use client'

import { consultarCep } from '@/actions/divida-ativa/consultar-cep'
import { Checkbox } from '@/components/ui/checkbox'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import {
  formatarCep,
  formatarCnpj,
  formatarCpf,
  formatarTelefone,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  type DadosCorrespondencia,
  type TipoPessoa,
  dadosCorrespondenciaSchema,
} from './dados-requerimento-schema'
import {
  lerDadosCorrespondencia,
  lerDadosRequerente,
  salvarDadosCorrespondencia,
} from './dados-requerimento-storage'

/** Endereço do perfil id.rio, já no formato do formulário. Campos ausentes vêm vazios. */
export interface EnderecoPerfil {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
}

interface DadosCorrespondenciaFormProps {
  /** Nome e CPF do login — o que "usar meus dados" copia. */
  nome: string
  cpf: string
  /** Endereço do perfil, ponto de partida do formulário. */
  endereco: EnderecoPerfil
  searchParamsAtual: Record<string, string>
}

/** Campos do endereço que a consulta do CEP preenche e trava. */
type CampoDoCep = 'logradouro' | 'bairro' | 'municipio' | 'uf'

/** Campos que "usar meus dados" copia do requerente e trava. */
const CAMPOS_DO_REQUERENTE = [
  'nome',
  'documento',
  'telefone',
  'email',
] as const satisfies readonly (keyof DadosCorrespondencia)[]

/**
 * "Endereço de correspondência" — etapa do requerimento entre os dados do requerente e os
 * documentos. É para onde a PGM manda as comunicações do pedido.
 *
 * Não existe no Figma: espelha "Dados de Correspondência" do portal legado, com duas
 * conveniências que ele não tinha:
 *
 * - **"Usar meus dados"** (marcado por padrão) copia nome, CPF, telefone e e-mail do
 *   requerente — o caso comum é o próprio cidadão receber as comunicações. Desmarcar libera os
 *   campos para outra pessoa, física ou jurídica.
 * - **O endereço chega preenchido do perfil id.rio**, quando existe.
 *
 * O CEP completo consulta o endereço (`consultarCep`) e trava o que a consulta trouxe, como no
 * legado. O que vier vazio — CEP geral de cidade não tem logradouro — fica editável, e CEP não
 * encontrado libera tudo para digitação.
 */
export function DadosCorrespondenciaForm({
  nome,
  cpf,
  endereco,
  searchParamsAtual,
}: DadosCorrespondenciaFormProps) {
  const router = useRouter()
  const idUsarMeusDados = useId()
  const [consultandoCep, startConsultaCep] = useTransition()
  const [camposDoCep, setCamposDoCep] = useState<Set<CampoDoCep>>(new Set())
  const [usarMeusDados, setUsarMeusDados] = useState(true)
  const ultimoCepConsultado = useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<DadosCorrespondencia>({
    resolver: zodResolver(dadosCorrespondenciaSchema),
    defaultValues: {
      nome,
      tipoPessoa: 'FISICA',
      documento: formatarCpf(cpf),
      telefone: '',
      email: '',
      ...endereco,
      cep: formatarCep(endereco.cep),
    },
  })

  const tipoPessoa = watch('tipoPessoa')

  // Em efeito: `sessionStorage` não existe no servidor. Telefone e e-mail do requerente
  // vêm da etapa anterior; a correspondência salva, se houver, tem precedência sobre tudo.
  useEffect(() => {
    const requerente = lerDadosRequerente()
    const salva = lerDadosCorrespondencia()

    if (salva) {
      reset(salva)
      const ehDoRequerente =
        salva.tipoPessoa === 'FISICA' &&
        somenteDigitos(salva.documento) === somenteDigitos(cpf) &&
        salva.nome === nome &&
        salva.telefone === requerente?.telefone &&
        salva.email === requerente?.email
      setUsarMeusDados(ehDoRequerente)
      ultimoCepConsultado.current = somenteDigitos(salva.cep)
      return
    }

    if (requerente) {
      setValue('telefone', requerente.telefone)
      setValue('email', requerente.email)
    }
  }, [reset, setValue, cpf, nome])

  function alternarUsarMeusDados(marcado: boolean) {
    setUsarMeusDados(marcado)
    if (!marcado) return

    const requerente = lerDadosRequerente()
    setValue('nome', nome)
    setValue('tipoPessoa', 'FISICA')
    setValue('documento', formatarCpf(cpf))
    setValue('telefone', requerente?.telefone ?? '')
    setValue('email', requerente?.email ?? '')
    clearErrors(CAMPOS_DO_REQUERENTE)
  }

  function trocarTipoPessoa(tipo: TipoPessoa) {
    setValue('tipoPessoa', tipo)
    setValue('documento', '')
    clearErrors('documento')
  }

  function buscarCep(cep: string) {
    const digitos = somenteDigitos(cep)
    if (digitos.length !== 8 || digitos === ultimoCepConsultado.current) return
    ultimoCepConsultado.current = digitos

    startConsultaCep(async () => {
      const resultado = await consultarCep(digitos)

      // O cidadão pode ter mudado o CEP enquanto a consulta corria.
      if (somenteDigitos(getValues('cep')) !== digitos) return

      if (!resultado.success) {
        setCamposDoCep(new Set())
        setError('cep', { message: resultado.error })
        return
      }

      const preenchidos = new Set<CampoDoCep>()
      const valores: Record<CampoDoCep, string> = {
        logradouro: resultado.data.logradouro,
        bairro: resultado.data.bairro,
        municipio: resultado.data.cidade,
        uf: resultado.data.uf,
      }
      for (const [campo, valor] of Object.entries(valores) as [
        CampoDoCep,
        string,
      ][]) {
        setValue(campo, valor)
        if (valor) preenchidos.add(campo)
      }
      setCamposDoCep(preenchidos)
      clearErrors(['cep', ...preenchidos])
    })
  }

  function continuar(dados: DadosCorrespondencia) {
    salvarDadosCorrespondencia(dados)

    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('etapa', 'documentos')
    router.push(`/divida-ativa/parcelamento/requerimento?${destino}`)
  }

  const travadoPeloCep = (campo: CampoDoCep) => camposDoCep.has(campo)
  const juridica = tipoPessoa === 'JURIDICA'

  return (
    <form
      onSubmit={handleSubmit(continuar)}
      className="flex flex-1 flex-col px-4"
      noValidate
    >
      <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
        Endereço de correspondência
      </h1>

      <p className="pb-6 text-sm font-normal leading-5 text-foreground-light">
        Informe para quem e para onde devemos enviar as comunicações sobre o
        pedido de parcelamento.
      </p>

      <div className="flex flex-col gap-4">
        <label
          htmlFor={idUsarMeusDados}
          className="flex cursor-pointer items-center gap-3 rounded-2xl bg-card p-4"
        >
          <Checkbox
            id={idUsarMeusDados}
            checked={usarMeusDados}
            onCheckedChange={marcado => alternarUsarMeusDados(marcado === true)}
          />
          <span className="text-sm font-normal leading-5 text-foreground">
            Usar meus dados (nome, CPF, telefone e e-mail)
          </span>
        </label>

        <CustomInput
          id="correspondencia-nome"
          label="Nome completo"
          isRequired
          autoComplete="name"
          isEditable={!usarMeusDados}
          error={errors.nome?.message}
          {...register('nome')}
        />

        {!usarMeusDados && (
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-sm font-normal text-primary">
              Tipo de pessoa<span className="ml-1 text-destructive">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['FISICA', 'Física'],
                  ['JURIDICA', 'Jurídica'],
                ] as const
              ).map(([valor, rotulo]) => (
                <label
                  key={valor}
                  className={`flex cursor-pointer items-center justify-center rounded-full p-3 text-sm transition-colors ${
                    tipoPessoa === valor
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-card hover:bg-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo-pessoa"
                    value={valor}
                    checked={tipoPessoa === valor}
                    onChange={() => trocarTipoPessoa(valor)}
                    className="sr-only"
                  />
                  {rotulo}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <CustomInput
          id="correspondencia-documento"
          label={juridica ? 'CNPJ' : 'CPF'}
          isRequired
          inputMode="numeric"
          autoComplete="off"
          placeholder={juridica ? '00.000.000/0000-00' : '000.000.000-00'}
          isEditable={!usarMeusDados}
          error={errors.documento?.message}
          {...register('documento', {
            onChange: event =>
              setValue(
                'documento',
                juridica
                  ? formatarCnpj(event.target.value)
                  : formatarCpf(event.target.value)
              ),
          })}
        />

        <CustomInput
          id="correspondencia-cep"
          label="CEP"
          isRequired
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          hint={consultandoCep ? 'Buscando endereço...' : undefined}
          error={errors.cep?.message}
          {...register('cep', {
            onChange: event => {
              const valor = formatarCep(event.target.value)
              setValue('cep', valor)
              if (somenteDigitos(valor).length < 8) {
                // CEP mudou: o que veio do anterior deixa de valer como travado.
                setCamposDoCep(new Set())
                ultimoCepConsultado.current = null
              }
              buscarCep(valor)
            },
          })}
        />

        <CustomInput
          id="correspondencia-logradouro"
          label="Logradouro"
          isRequired
          autoComplete="address-line1"
          isEditable={!travadoPeloCep('logradouro')}
          error={errors.logradouro?.message}
          {...register('logradouro')}
        />

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            id="correspondencia-numero"
            label="Número"
            isRequired
            autoComplete="off"
            error={errors.numero?.message}
            {...register('numero')}
          />
          <CustomInput
            id="correspondencia-complemento"
            label="Complemento"
            autoComplete="address-line2"
            error={errors.complemento?.message}
            {...register('complemento')}
          />
        </div>

        <CustomInput
          id="correspondencia-bairro"
          label="Bairro"
          isRequired
          isEditable={!travadoPeloCep('bairro')}
          error={errors.bairro?.message}
          {...register('bairro')}
        />

        <div className="grid grid-cols-[1fr_6rem] gap-4">
          <CustomInput
            id="correspondencia-municipio"
            label="Município"
            isRequired
            autoComplete="address-level2"
            isEditable={!travadoPeloCep('municipio')}
            error={errors.municipio?.message}
            {...register('municipio')}
          />
          <CustomInput
            id="correspondencia-uf"
            label="UF"
            isRequired
            maxLength={2}
            autoComplete="address-level1"
            isEditable={!travadoPeloCep('uf')}
            error={errors.uf?.message}
            {...register('uf', {
              onChange: event =>
                setValue('uf', event.target.value.toUpperCase()),
            })}
          />
        </div>

        <CustomInput
          id="correspondencia-telefone"
          label="Telefone"
          isRequired
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(00) 00000-0000"
          isEditable={!usarMeusDados}
          error={errors.telefone?.message}
          {...register('telefone', {
            onChange: event =>
              setValue('telefone', formatarTelefone(event.target.value)),
          })}
        />

        <CustomInput
          id="correspondencia-email"
          label="E-mail"
          isRequired
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
          isEditable={!usarMeusDados}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="pt-6 pb-2">
        <CustomButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={consultandoCep}
        >
          Continuar
        </CustomButton>
      </div>
    </form>
  )
}

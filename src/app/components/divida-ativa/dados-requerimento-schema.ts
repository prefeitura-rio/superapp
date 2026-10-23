import {
  isCnpjValido,
  isCpfValido,
  isTelefoneValido,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { z } from 'zod'

/**
 * Dados do requerente e de correspondência do requerimento de parcelamento.
 *
 * O Figma não tem estas telas; os campos e as regras espelham o portal legado e a validação
 * da `api-imoveis` (`validarDadosRequerimento`). Validar aqui o que a API valida evita que o
 * cidadão só descubra o erro no envio, depois de anexar os documentos.
 *
 * Os valores ficam **mascarados** no formulário; `paraApi` tira as máscaras no envio.
 *
 * Sem `'use client'`: a Server Action revalida com os mesmos schemas.
 */

const telefone = z
  .string()
  .trim()
  .min(1, 'Informe o telefone.')
  .refine(isTelefoneValido, 'Informe o telefone com DDD.')

const email = z
  .string()
  .trim()
  .min(1, 'Informe o e-mail.')
  .pipe(z.email('Informe um e-mail válido.'))

export const dadosRequerenteSchema = z.object({ telefone, email })

export type DadosRequerente = z.infer<typeof dadosRequerenteSchema>

/** `FISICA` → CPF, `JURIDICA` → CNPJ. */
export type TipoPessoa = 'FISICA' | 'JURIDICA'

export const dadosCorrespondenciaSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, 'Informe o nome completo.')
      .max(100, 'O nome pode ter no máximo 100 caracteres.'),
    tipoPessoa: z.enum(['FISICA', 'JURIDICA']),
    documento: z.string().trim(),
    cep: z
      .string()
      .refine(v => somenteDigitos(v).length === 8, 'Informe o CEP.'),
    logradouro: z.string().trim().min(1, 'Informe o logradouro.'),
    numero: z.string().trim().min(1, 'Informe o número.'),
    complemento: z.string().trim(),
    bairro: z.string().trim().min(1, 'Informe o bairro.'),
    municipio: z.string().trim().min(1, 'Informe o município.'),
    uf: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, 'Informe a UF com duas letras.'),
    telefone,
    email,
  })
  .superRefine((dados, ctx) => {
    const juridica = dados.tipoPessoa === 'JURIDICA'
    const valido = juridica
      ? isCnpjValido(dados.documento)
      : isCpfValido(dados.documento)

    if (!valido) {
      ctx.addIssue({
        code: 'custom',
        path: ['documento'],
        message:
          dados.documento === ''
            ? `Informe o ${juridica ? 'CNPJ' : 'CPF'}.`
            : `${juridica ? 'CNPJ' : 'CPF'} inválido.`,
      })
    }
  })

export type DadosCorrespondencia = z.infer<typeof dadosCorrespondenciaSchema>

/**
 * Campos do `RequerimentoParcelamentoRequest`, no formato que a API espera: só dígitos em
 * telefone, CPF/CNPJ e CEP; `tipoDoc` com o código legado (1=CPF, 2=CNPJ); UF em maiúsculas.
 *
 * O nome do requerente não sai daqui: a Server Action o lê do token, não do cliente.
 */
export function paraApi(
  requerente: DadosRequerente,
  correspondencia: DadosCorrespondencia
) {
  return {
    numTelefoneRequerente: somenteDigitos(requerente.telefone),
    txtEmailRequerente: requerente.email.trim(),
    nomeCorr: correspondencia.nome.trim(),
    tipoDoc: correspondencia.tipoPessoa === 'JURIDICA' ? '2' : '1',
    numCPFCorr: somenteDigitos(correspondencia.documento),
    numCEPCorr: somenteDigitos(correspondencia.cep),
    txtLogradouroEnderecoCorr: correspondencia.logradouro.trim(),
    numEnderecoCorr: correspondencia.numero.trim(),
    txtComplementoEnderecoCorr: correspondencia.complemento.trim() || undefined,
    txtBairroEnderecoCorr: correspondencia.bairro.trim(),
    txtCidadeEnderecoCorr: correspondencia.municipio.trim(),
    txtUfEnderecoCorr: correspondencia.uf.trim().toUpperCase(),
    numTelefoneCorr: somenteDigitos(correspondencia.telefone),
    txtEmailCorr: correspondencia.email.trim(),
  }
}

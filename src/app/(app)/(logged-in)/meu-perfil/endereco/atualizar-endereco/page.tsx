'use client'

import { updateAddress } from '@/actions/update-user-address'
import { AddressDetailsDrawerContent } from '@/app/components/drawer-contents/address-details-drawer-content'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/custom/search-input'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import {
  cleanLogradouroForSubmission,
  extractNumberFromAddress,
  parseAddressForSubmission,
  parseAddressFromGoogle,
} from '@/lib/address-parser'
import type {
  AddressSubmissionData,
  GoogleAddressSuggestion,
} from '@/types/address'
import { zodResolver } from '@hookform/resolvers/zod'
import confetti from 'canvas-confetti'
import { MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Define the schema for address validation
const addressFormSchema = z
  .object({
    number: z
      .string()
      .min(1, 'Número é obrigatório')
      .optional()
      .or(z.literal('')),
    complement: z.string().optional(),
    cep: z.string().optional(),
    noNumber: z.boolean(),
    noComplement: z.boolean(),
    noCep: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.noNumber && !data.number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Número é obrigatório',
        path: ['number'],
      })
    }
    if (
      !data.noComplement &&
      (!data.complement || data.complement.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Campo obrigatório',
        path: ['complement'],
      })
    }
    if (!data.noCep && (!data.cep || !/^\d{5}-\d{3}$/.test(data.cep))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CEP inválido. Formato: 00000-000',
        path: ['cep'],
      })
    }
  })

export type AddressFormSchema = z.infer<typeof addressFormSchema>

export default function AddressForm() {
  const [hasInteracted, setHasInteracted] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<GoogleAddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [feedbackDrawerOpen, setFeedbackDrawerOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] =
    useState<GoogleAddressSuggestion | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Initialize react-hook-form
  const form = useForm<AddressFormSchema>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      noNumber: false,
      noComplement: false,
      noCep: false,
      number: '',
      complement: '',
      cep: '',
    },
  })

  const { setValue, watch, reset, trigger } = form

  const noNumber = watch('noNumber')
  const noComplement = watch('noComplement')
  const noCep = watch('noCep')

  // Clear number input and error if 'noNumber' is checked
  useEffect(() => {
    if (noNumber) {
      setValue('number', '')
    }
  }, [noNumber, setValue])

  // Clear complement input and error if 'noComplement' is checked
  useEffect(() => {
    if (noComplement) {
      setValue('complement', '')
    }
  }, [noComplement, setValue])

  // Clear cep input and error if 'noCep' is checked
  useEffect(() => {
    if (noCep) {
      setValue('cep', '')
    }
  }, [noCep, setValue])

  // Animation classes
  const headerAnim = hasInteracted
    ? '-translate-y-20 opacity-0 pointer-events-none transition-all duration-500'
    : 'transition-all duration-500'
  const inputAnim = hasInteracted
    ? '-translate-y-54 transition-all duration-500'
    : 'transition-all duration-500'

  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([])
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const debounce = setTimeout(() => {
      fetch(`/api/address-autocomplete?q=${encodeURIComponent(inputValue)}`, {
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(data => setSuggestions(data.results || []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 400)
    return () => {
      clearTimeout(debounce)
      controller.abort()
    }
  }, [inputValue])

  // Function to lookup CEP using ViaCEP API
  const lookupCep = async (
    placeId: string,
    number?: string,
    addressItem?: GoogleAddressSuggestion
  ): Promise<string | null> => {
    // Use provided addressItem or fall back to selectedAddress
    const address = addressItem || selectedAddress
    if (!address) return null

    setCepLoading(true)
    try {
      const parsedAddress = parseAddressFromGoogle(address)

      if (
        !parsedAddress.uf ||
        !parsedAddress.cidade ||
        !parsedAddress.logradouro
      ) {
        console.log('Missing required data for CEP lookup:', parsedAddress)
        return null
      }

      const params = new URLSearchParams({
        uf: parsedAddress.uf,
        cidade: parsedAddress.cidade,
        logradouro: parsedAddress.logradouro,
      })

      // Add number if provided
      if (number) {
        params.append('numero', number)
      }

      const response = await fetch(`/api/viacep-lookup?${params.toString()}`)
      const data = await response.json()

      if (response.ok && data.cep) {
        return data.cep
      }
      return null
    } catch (error) {
      console.error('Error looking up CEP:', error)
      return null
    } finally {
      setCepLoading(false)
    }
  }

  const handleSuggestionClick = async (item: GoogleAddressSuggestion) => {
    setSelectedAddress(item)

    // Extract number from address
    const numero = extractNumberFromAddress(item.main_text)

    console.log(
      'Address selected:',
      item.main_text,
      'Number extracted:',
      numero
    )

    // Lookup CEP if we have a number
    let cep = ''
    if (numero) {
      console.log('Looking up CEP for number:', numero)
      const foundCep = await lookupCep(item.place_id, numero, item)
      if (foundCep) {
        console.log('Found CEP:', foundCep)
        cep = foundCep
      } else {
        console.log('No CEP found for number:', numero)
      }
    }

    reset({
      number: numero,
      complement: '',
      cep: cep,
      noNumber: false,
      noComplement: false,
      noCep: false,
    })
    setDrawerOpen(true)
  }

  // CEP input formatting handler
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Remove non-digits
    if (value.length > 8) value = value.slice(0, 8)
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`
    }
    setValue('cep', value)
    trigger('cep') // Trigger validation on change
  }

  const onSubmit = async (data: AddressFormSchema) => {
    if (!selectedAddress) return

    const parsedAddress = parseAddressForSubmission(selectedAddress)

    let cepToSend = ''
    if (data.noCep) {
      cepToSend = 'Não informado'
    } else if (data.cep) {
      cepToSend = data.cep.replace(/\D/g, '')
    }

    // Clean the logradouro by removing any existing number to avoid duplication
    const cleanLogradouro = cleanLogradouroForSubmission(
      selectedAddress.main_text
    )

    const addressData: AddressSubmissionData = {
      logradouro: cleanLogradouro,
      tipo_logradouro: '',
      numero: data.noNumber ? 'S/N' : data.number || '',
      complemento: data.noComplement ? '' : data.complement || '',
      bairro: parsedAddress.bairro,
      municipio: parsedAddress.municipio,
      estado: parsedAddress.estado,
      cep: cepToSend,
    }

    try {
      const result = await updateAddress(addressData)

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
        })
        setDrawerOpen(false)
        setFeedbackDrawerOpen(true)
      }
    } catch (error: any) {
      // Redirect to session expired page on any error
      router.push('/sessao-expirada')
    }
  }

  const handleFocusInput = () => {
    setHasInteracted(true)

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (inputContainerRef.current) {
          window.scrollTo({
            top: -54,
            behavior: 'auto',
          })
        }
      }, 100)
    }
  }

  return (
    <div className="max-w-4xl h-[70lvh] mx-auto pt-24 flex flex-col space-y-6">
      <div className={headerAnim}>
        <SecondaryHeader title="" route="/meu-perfil" />
        <section className="relative">
          <h2 className="text-5xl px-4 font-normal leading-11 mb-2 pt-1 text-foreground bg-background z-10 pb-3">
            Escreva seu <br /> endereço
          </h2>
        </section>
      </div>
      <div ref={inputContainerRef} className={`px-4 ${inputAnim}`}>
        <SearchInput
          ref={inputRef}
          placeholder="Digite o seu endereço"
          showIcons={hasInteracted}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={handleFocusInput}
          onBack={() => router.back()}
        />
        {hasInteracted && inputValue.length > 0 && (
          <div className="bg-transparent mt-2">
            {loading && (
              <div className="p-4 pt-10 text-muted-foreground text-center text-sm">
                Carregando...
              </div>
            )}
            {!loading && suggestions.length > 0 && (
              <div className="flex flex-col">
                {suggestions.map(
                  (item: GoogleAddressSuggestion, idx: number) => (
                    <div key={item.place_id}>
                      <div
                        className="flex px-2 items-center gap-3 py-5 cursor-pointer hover:bg-accent/30"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <MapPin className="h-5 w-5" />
                        <div>
                          <div className="font-medium text-foreground leading-tight text-base">
                            {item.main_text}
                          </div>
                          <div className="text-sm text-muted-foreground leading-tight">
                            {item.secondary_text}
                          </div>
                        </div>
                      </div>
                      {idx !== suggestions.length - 1 && (
                        <div className="border-b border-border mx-4" />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
            {!loading && suggestions.length === 0 && inputValue.length > 2 && (
              <div className="p-4 pt-10 text-muted-foreground text-center text-sm">
                Nenhum endereço encontrado.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer for address details */}
      <AddressDetailsDrawerContent
        selectedAddress={selectedAddress}
        form={form}
        onSubmit={onSubmit}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        handleCepChange={handleCepChange}
        lookupCep={lookupCep}
        cepLoading={cepLoading}
      />

      {/* Drawer for feedback after address update */}
      <Drawer open={feedbackDrawerOpen} onOpenChange={setFeedbackDrawerOpen}>
        <DrawerContent className="max-w-none mx-auto rounded-t-none! min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col min-h-[60vh] items-center justify-evenly bg-background px-4 py-8">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-4xl font-medium leading-10 mb-6">
                Endereço <br />
                atualizado!
              </DrawerTitle>
            </DrawerHeader>
            <ThemeAwareVideo
              source={VIDEO_SOURCES.updatedAddress}
              containerClassName="mb-10 flex items-center justify-center  h-[min(328px,40vh)] max-h-[328px]"
            />
            <Button
              size="lg"
              className="w-full max-w-xs mt-8 bg-primary hover:bg-primary/90 rounded-lg font-normal text-background"
              onClick={() => {
                setDrawerOpen(false)
                router.back()
              }}
            >
              Finalizar
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

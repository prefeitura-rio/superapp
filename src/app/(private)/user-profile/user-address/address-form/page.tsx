'use client'
import { updateAddress } from '@/actions/update-user-address'
import { SecondaryHeader } from '@/app/(private)/components/secondary-header'
import welcomeImage from '@/assets/welcome.svg'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/custom/search-input'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import confetti from 'canvas-confetti'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
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

type AddressFormSchema = z.infer<typeof addressFormSchema>

export default function AddressForm() {
  const [hasInteracted, setHasInteracted] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [feedbackDrawerOpen, setFeedbackDrawerOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormSchema>({
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

  const handleSuggestionClick = (item: any) => {
    setSelectedAddress(item)
    // extracts 'numero' from the address if it exists
    let numero = ''
    if (item.numero) {
      numero = item.numero
    } else if (item.main_text) {
      // extracts a number from the main_text (e.g., 'Rua X, 123')
      const match = item.main_text.match(/\b\d{1,6}\b/)
      if (match) {
        numero = match[0]
      }
    }
    reset({
      number: numero,
      complement: '',
      cep: '',
      noNumber: false,
      noComplement: false,
      noCep: false,
    }) // reset form and prefill number if found
    setDrawerOpen(true)
  }

  const onSubmit = async (data: AddressFormSchema) => {
    if (!selectedAddress) return

    // Construct the address data from the form inputs
    const addressParts = selectedAddress.secondary_text.split(', ')
    const addressData = {
      logradouro: selectedAddress.main_text,
      tipo_logradouro: '',
      numero: data.noNumber ? 'S/N' : data.number || '',
      complemento: data.noComplement ? '' : data.complement || '',
      bairro: addressParts[0] || '',
      municipio: addressParts[1] || '',
      estado: addressParts[2] || '',
      cep: data.noCep ? '' : data.cep || '',
    }

    try {
      const result = await updateAddress(addressData)

      if (result.error) {
        console.error(result.error)
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
        })
        setDrawerOpen(false)
        setFeedbackDrawerOpen(true)
      }
    } catch (error) {
      console.error('Ocorreu um erro ao atualizar o endereço')
    }
  }

  return (
    <div className="max-w-md mx-auto pt-24 flex flex-col space-y-6">
      <div className={headerAnim}>
        <SecondaryHeader title="" />
        <section className="relative">
          <h2 className="text-5xl px-4 font-normal leading-11 mb-2 pt-1 text-foreground bg-background z-10 pb-3">
            Escreva seu <br /> endereço
          </h2>
        </section>
      </div>
      <div className={`px-4 ${inputAnim}`}>
        <SearchInput
          ref={inputRef}
          placeholder="Digite o seu endereço"
          showIcons={hasInteracted}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => setHasInteracted(true)}
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
                {suggestions.map((item: any, idx: number) => (
                  <div key={item.place_id}>
                    <div
                      className="flex px-2 items-center gap-3 py-5 cursor-pointer hover:bg-accent/30"
                      onKeyDown={() => handleSuggestionClick(item)}
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
                ))}
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
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-md mx-auto rounded-t-3xl! sm:min-h-[80vh]! min-h-[85vh] flex flex-col">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-lg font-semibold">
              {selectedAddress?.main_text}
            </DrawerTitle>
            <div className="text-muted-foreground text-base">
              {selectedAddress?.secondary_text}
            </div>
          </DrawerHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-4 flex-1 flex flex-col pt-5 gap-4 overflow-y-auto"
          >
            <div>
              <Input
                className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground"
                placeholder="Escreva o número"
                {...register('number')}
                disabled={noNumber}
              />
              {errors.number && !noNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.number.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Switch
                checked={noNumber}
                onCheckedChange={checked => setValue('noNumber', checked)}
                id="no-number"
              />
              <Label
                htmlFor="no-number"
                className="text-muted-foreground text-base select-none"
              >
                Sem número
              </Label>
            </div>
            <div>
              <Input
                className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground"
                placeholder="Escreva o complemento"
                {...register('complement')}
                disabled={noComplement}
              />
              {errors.complement && !noComplement && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.complement.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Switch
                checked={noComplement}
                onCheckedChange={checked => setValue('noComplement', checked)}
                id="no-complement"
              />
              <Label
                htmlFor="no-complement"
                className="text-muted-foreground text-base select-none"
              >
                Sem complemento
              </Label>
            </div>
            <div>
              <Input
                className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground"
                placeholder="Escreva o CEP"
                {...register('cep')}
                disabled={noCep}
                maxLength={9}
              />
              {errors.cep && !noCep && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cep.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Switch
                checked={noCep}
                onCheckedChange={checked => setValue('noCep', checked)}
                id="no-cep"
              />
              <Label
                htmlFor="no-cep"
                className="text-muted-foreground text-base select-none"
              >
                Sem CEP
              </Label>
            </div>
            <DrawerFooter className="flex flex-row gap-3 px-0">
              <Button
                size="lg"
                className="flex-1 py-4 text-base"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                size="lg"
                className="flex-1 py-4 text-base border"
                variant="secondary"
                type="button"
                onClick={() => {
                  setDrawerOpen(false)
                  router.back()
                }}
              >
                Cancelar
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Drawer for feedback after address update */}
      <Drawer open={feedbackDrawerOpen} onOpenChange={setFeedbackDrawerOpen}>
        <DrawerContent className="max-w-md mx-auto rounded-t-none! min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col min-h-[60vh] items-center justify-evenly bg-background px-4 py-8">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-4xl font-medium leading-10 mb-6">
                Endereço <br />
                atualizado!
              </DrawerTitle>
            </DrawerHeader>
            <Image
              src={welcomeImage}
              alt="Endereço atualizado"
              width={260}
              height={320}
              className="mx-auto mb-10"
              style={{ objectFit: 'contain', maxHeight: '320px' }}
              priority
            />
            <Button
              size="lg"
              className="w-full max-w-xs mt-8 bg-primary hover:bg-primary/90 rounded-lg font-normal"
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

'use client'

import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import govbr from '@/assets/govbr.svg'
import prefeitura from '@/assets/prefeitura.svg'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Set a fake token cookie
    document.cookie = `token=fake-token-value; path=/; max-age=${60 * 60 * 24}`

    // Redirect to /services
    router.push('/')
  }
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-white p-4">
      <div className="flex flex-col items-start gap-6">
        {/* Logo */}
        <div className="w-full flex justify-center">
          <Image src={prefeitura} alt="Prefeitura RIO" width={87} height={45} />
        </div>

        {/* Login Header */}
        <div className="space-y-1">
          <h1 className="text-2xl text-foreground font-semibold">Login</h1>
          <p className="text-sm text-gray-400 font-normal">
            Entre com os seus dados e senha para acessar a sua conta
          </p>
        </div>

        {/* Gov.br Button */}
        <Button
          variant="default"
          className="w-full h-12 rounded-full bg-gray-200 hover:bg-zinc-700 text-foreground cursor-pointer"
        >
          <span className="flex items-center justify-center w-full">
            <span className="pr-2 text-foreground font-medium">
              Acessar com
            </span>
            <Image src={govbr} alt="Gov br" width={64} height={25} />
          </span>
        </Button>

        {/* Divider */}
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full text-stroke-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-sm text-stroke-100">
              ou
            </span>
          </div>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-6" onSubmit={handleLogin}>
          <div className="flex flex-col gap-1 font-medium">
            <label htmlFor="cpf" className="text-sm">
              CPF
            </label>
            <Input
              id="cpf"
              type="text"
              placeholder="123.456.789-00"
              className="h-12 px-5 rounded-full bg-gray-200 text-white placeholder:text-gray-300"
            />
          </div>

          <div className="flex flex-col gap-1 font-medium">
            <label htmlFor="password" className="text-sm">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Escreva sua senha ..."
                className="h-12 px-5 rounded-full bg-gray-200 text-white placeholder:text-gray-300 "
              />
              <Button
                variant="ghost"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-normal text-gray-400">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="border-zinc-700 data-[state=checked]:bg-red-500 cursor-pointer"
              />
              <label htmlFor="remember">Lembrar de mim</label>
            </div>
            <Link href="#" className="hover:text-white">
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            variant="default"
            type="submit"
            className="w-full h-12 rounded-full cursor-pointer text-background font-semibold"
          >
            Login
          </Button>
        </form>

        {/* Register */}
        <p className="w-full text-sm text-center text-gray-400">
          Ainda não tem uma conta?{' '}
          <Link href="#" className="text-white hover:underline">
            Cadastre aqui
          </Link>
        </p>

        {/* Privacy */}
        <div className="w-full text-center">
          <Link href="/privacy-policy" className="text-xs text-gray-100">
            Aviso de privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}

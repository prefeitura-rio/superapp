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
export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src={prefeitura}
            alt="Prefeitura RIO"
            width={87}
            height={45}
            // className="invert"
          />
        </div>

        {/* Login Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-sm text-gray-400">
            Entre com os seus dados e senha para acessar a sua conta
          </p>
        </div>

        {/* Google Login Button */}
        <Button
          variant="outline"
          className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
        >
          <span className="flex items-center justify-center">
            <span className="pr-2">Acessar com</span>

            <Image
              src={govbr}
              alt="Gov br"
              width={64}
              height={25}
              className="ratio"
            />
          </span>
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-zinc-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-black px-2 text-xs text-gray-400">ou</span>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cpf" className="text-xs">
              CPF
            </label>
            <Input
              id="cpf"
              type="text"
              placeholder="123.456.789-00"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Escreva sua senha..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="border-zinc-700 data-[state=checked]:bg-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-400">
                Lembrar de mim
              </label>
            </div>
            <Link href="#" className="text-sm text-gray-400 hover:text-white">
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Login
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center text-sm text-gray-400">
          Ainda não tem uma conta?{' '}
          <Link href="#" className="text-white hover:underline">
            Cadastre aqui
          </Link>
        </div>

        {/* Privacy Notice */}
        <div className="text-center">
          <Link href="#" className="text-xs text-gray-500 hover:text-gray-400">
            Aviso de privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}

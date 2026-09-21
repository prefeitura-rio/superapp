import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { PetCardFrontContent, isValidImageSrc } from '../pet-card-front-content'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
  }: {
    src: string
    alt: string
  }) => <img src={src} alt={alt} />,
}))

const FALLBACK_CANINE =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar9.png'

const baseProps = {
  title: 'REGISTRO GERAL DE ANIMAIS',
  name: 'Rex',
  species: 'Canina',
  sex: 'Macho',
  microchipStatus: 'Pendente',
}

describe('isValidImageSrc', () => {
  test('rejects empty, placeholder and invalid values', () => {
    expect(isValidImageSrc(undefined)).toBe(false)
    expect(isValidImageSrc('')).toBe(false)
    expect(isValidImageSrc('string')).toBe(false)
    expect(isValidImageSrc('not-a-url')).toBe(false)
  })

  test('accepts http(s) and root-relative paths', () => {
    expect(isValidImageSrc('https://cdn.example.com/pet.png')).toBe(true)
    expect(isValidImageSrc('http://localhost:3000/pet.png')).toBe(true)
    expect(isValidImageSrc('/images/pet.png')).toBe(true)
  })
})

describe('PetCardFrontContent', () => {
  test('uses fallback avatar when foto_url is the OpenAPI placeholder "string"', () => {
    render(<PetCardFrontContent {...baseProps} petImageUrl="string" />)

    expect(screen.getByAltText('Foto de Rex')).toHaveAttribute(
      'src',
      FALLBACK_CANINE
    )
  })

  test('uses the provided photo when it is a valid URL', () => {
    const photoUrl = 'https://cdn.example.com/rex.png'
    render(<PetCardFrontContent {...baseProps} petImageUrl={photoUrl} />)

    expect(screen.getByAltText('Foto de Rex')).toHaveAttribute('src', photoUrl)
  })
})

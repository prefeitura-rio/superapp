'use client'

import toast from 'react-hot-toast'

interface FooterPhoneButtonProps {
  number: string
  display: string
}

export function FooterPhoneButton({ number, display }: FooterPhoneButtonProps) {
  function handleClick() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = `tel:${number.replace(/\D/g, '')}`
    } else {
      navigator.clipboard.writeText(number).then(() => {
        toast.success('Número copiado')
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm font-normal leading-5 tracking-normal text-[#0069A8] dark:text-[#0084D1] hover:underline text-left cursor-pointer"
    >
      {display}
    </button>
  )
}

'use client'

import toast from 'react-hot-toast'

export function Footer1746Link() {
  function handleClick() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = 'tel:1746'
    } else {
      navigator.clipboard.writeText('1746').then(() => {
        toast.success('Número copiado')
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm font-normal leading-none tracking-normal text-foreground-light hover:underline text-left cursor-pointer"
    >
      1746
    </button>
  )
}

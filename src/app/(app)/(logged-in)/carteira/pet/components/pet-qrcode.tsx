import { ChipIcon } from '@/assets/icons/chip-icon'
import { QRCodeSVG } from 'qrcode.react'

function QRCode({ payload }: { payload: string }) {
  return <QRCodeSVG value={payload} size={128} />
}

export function PetQRCode({ clinicName }: { clinicName: string }) {
  return (
    <div className="w-full py-8 px-6 bg-card flex flex-col justify-center items-center gap-4 rounded-md">
      <div className="flex gap-4 items-center">
        <ChipIcon className="h-6.5 text-foreground" />
        <p className="text-foreground text-sm leading-5">Microchip</p>
      </div>
      <QRCode payload={clinicName} />
      <p className="text-sm text-muted-foreground leading-5 mt-2">
        Clínica Credênciada
      </p>
      <p className="text-foreground text-sm leading-5 -mt-3">{clinicName}</p>
    </div>
  )
}

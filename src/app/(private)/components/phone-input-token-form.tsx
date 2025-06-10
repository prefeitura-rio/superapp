"use client";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

interface PhoneInputTokenFormProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PhoneInputTokenForm({ value, onChange }: PhoneInputTokenFormProps) {


  return (
    <>
      <form className="w-full flex flex-col gap-4">
      <InputOTP className="w-full" maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
      <div>
        <span className="text-sm text-card-foreground mt-1 block text-left">
          Não recebeu o código?<Button className="pl-2 text-muted-foreground font-normal" variant="ghost">Reenviar</Button>
        </span>
        <span className="text-sm text-muted-foreground block text-left">
         Você pode solicitar outro código em 60seg
        </span>
      </div>
      </form>
    </>
  );
}

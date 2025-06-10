"use client";

import type React from "react";

import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function PhoneInputForm() {
  const [countryCode, setCountryCode] = useState("55");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // If no digits, return empty string
    if (digits.length === 0) {
      return "";
    }

    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
        7,
        11
      )}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If user deletes the opening parenthesis, clear the entire field
    if (inputValue === "" || inputValue === "(") {
      setPhoneNumber("");
      return;
    }

    const formatted = formatPhoneNumber(inputValue);
    setPhoneNumber(formatted);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCountryCode(value);
  };

  return (
    <>
      <form className="w-full flex flex-col gap-4">
        <div className="w-full flex row gap-4">
          <Input
            id="country-code"
            type="text"
            value={countryCode}
            onChange={handleCountryCodeChange}
            placeholder="55"
            className="w-19 pl-7 bg-card border-border rounded-xl"
            maxLength={2}
          />
          <Input
            id="phone"
            type="text"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="(21) 98765-4321"
            className="flex-1 bg-card border-border rounded-xl"
            maxLength={15}
          />
        </div>
        <span className="text-sm text-card-foreground mt-1 block text-left">
          Você irá receber um código via Whatsapp
        </span>
      </form>
    </>
  );
}

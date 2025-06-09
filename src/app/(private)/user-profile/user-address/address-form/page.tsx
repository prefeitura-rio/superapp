'use client'
import { SecondaryHeader } from "@/app/(private)/components/secondary-header";
import { SearchInput } from "@/components/ui/custom/search-input";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";


export default function AddressForm() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Animation classes
  const headerAnim = hasInteracted ? "-translate-y-20 opacity-0 pointer-events-none transition-all duration-500" : "transition-all duration-500";
  const inputAnim = hasInteracted ? "-translate-y-54 transition-all duration-500" : "transition-all duration-500";

  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const debounce = setTimeout(() => {
      fetch(`/api/address-autocomplete?q=${encodeURIComponent(inputValue)}`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => setSuggestions(data.results || []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 400); // 400ms debounce
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [inputValue]);

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
              <div className="p-4 pt-10 text-muted-foreground text-center text-sm">Carregando...</div>
            )}
            {!loading && suggestions.length > 0 && (
              <div className="flex flex-col">
                {suggestions.map((item: any, idx: number) => (
                  <div key={item.place_id}>
                    <div className="flex px-2 items-center gap-3 py-5 cursor-pointer hover:bg-accent/30">
                      <MapPin className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-foreground leading-tight text-base">{item.main_text}</div>
                        <div className="text-sm text-muted-foreground leading-tight">{item.secondary_text}</div>
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
              <div className="p-4 pt-10 text-muted-foreground text-center text-sm">Nenhum endereço encontrado.</div>
            )}
          </div>
        )}
      </div>
    </div>
    )
}

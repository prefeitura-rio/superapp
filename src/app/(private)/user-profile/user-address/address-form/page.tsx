'use client'
import { updateAddress } from "@/actions/update-user-address";
import { SecondaryHeader } from "@/app/(private)/components/secondary-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/custom/search-input";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";


export default function AddressForm() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [number, setNumber] = useState("");
  const [noNumber, setNoNumber] = useState(false);
  const [complement, setComplement] = useState("");
  const [noComplement, setNoComplement] = useState(false);
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

  const handleSuggestionClick = (item: any) => {
    setSelectedAddress(item);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAddress) return;
    
    // Construct the address data from the form inputs
    const addressParts = selectedAddress.secondary_text.split(', ');
    const addressData = {
      logradouro: selectedAddress.main_text,
      tipo_logradouro: '', // Might need to extract this from the address
      numero: noNumber ? 'S/N' : number,
      complemento: noComplement ? '' : complement,
      bairro: addressParts[0] || '', // Neighborhood is usually first part
      municipio: addressParts[1] || '', // City is usually second part
      estado: addressParts[2] || '', // State is usually third part
      cep: '23013620' // Might need to get cep from another API or input
    };

    try {
      const result = await updateAddress(addressData);
      
      if (result.error) {
        console.error(result.error);
      } else {
        console.log('Endereço atualizado com sucesso!');
        setDrawerOpen(false);
        router.back();
      }
    } catch (error) {
      console.error('Ocorreu um erro ao atualizar o endereço');
    }
  };

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
                    <div className="flex px-2 items-center gap-3 py-5 cursor-pointer hover:bg-accent/30" onClick={() => handleSuggestionClick(item)}>
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

      {/* Drawer for address details */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-md pt-5 pb-5 mx-auto rounded-t-3xl!">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-lg font-semibold">
              {selectedAddress?.main_text}
            </DrawerTitle>
            <div className="text-muted-foreground text-base">
              {selectedAddress?.secondary_text}
            </div>
          </DrawerHeader>
          <div className="px-4 flex flex-col pt-5 gap-4">
              <Input
                className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground"
                placeholder="Escreva o número"
                value={noNumber ? "" : number}
                onChange={e => setNumber(e.target.value)}
                disabled={noNumber}
              />
            <div className="flex items-center gap-2 mb-2">
              <Switch checked={noNumber} onCheckedChange={setNoNumber} id="no-number" />
              <Label htmlFor="no-number" className="text-muted-foreground text-base select-none">Sem número</Label>
            </div>
              <Input
                className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground"
                placeholder="Escreva o complemento"
                value={noComplement ? "" : complement}
                onChange={e => setComplement(e.target.value)}
                disabled={noComplement}
              />
            <div className="flex items-center gap-2 mb-2">
              <Switch checked={noComplement} onCheckedChange={setNoComplement} id="no-complement" />
              <Label htmlFor="no-complement" className="text-muted-foreground text-base select-none">Sem complemento</Label>
            </div>
          </div>
          <DrawerFooter className="flex flex-row gap-3 px-4 pb-6 pt-8">
            <Button size="lg" className="flex-1 py-4 text-base" onClick={handleSave}>Salvar</Button>
            <Button size="lg" className="flex-1 py-4 text-base border" variant="outline" onClick={() => { setDrawerOpen(false); router.back(); }}>Cancelar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
    )
}

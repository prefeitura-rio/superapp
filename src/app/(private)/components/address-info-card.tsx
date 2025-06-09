import { Badge } from "@/components/ui/badge";
import type { ModelsEnderecoPrincipal } from "@/http/models/modelsEnderecoPrincipal";
import { MapPin, MoreVertical } from "lucide-react";

interface AddressInfoCardProps {
  address: ModelsEnderecoPrincipal | null;
}

export function AddressInfoCard({ address }: AddressInfoCardProps) {
  // Helper to format address string
  const mainLine = address
    ? `${address.tipo_logradouro || ''} ${address.logradouro || ''}, ${address.numero || ''}`.trim()
    : "Endereço não disponível";
  const complemento = address?.complemento;
  const bairroCidade = address
    ? `${address.bairro || ''}${address.bairro && address.municipio ? ', ' : ''}${address.municipio || ''}${address.estado ? ', ' + address.estado : ''}`.trim()
    : "";
  return (
    <div className="min-h-screen p-4">
      <div className="bg-card rounded-2xl p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-1">
            <MapPin className="w-6 h-6 text-gray-600" />
          </div>

          <div className="flex-1 space-y-1">
            <h2 className="font-medium text-card-foreground text-base">{mainLine}</h2>
            {complemento && <p className="text-foreground-light text-sm">{complemento}</p>}
            <p className="text-foreground-light text-sm">{bairroCidade}</p>

            <div className="pt-4">
              <Badge
                variant="destructive"
                className="px-3 py-0.5 text-sm rounded-full"
              >
                Desatualizado
              </Badge>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="hover:text-gray-700 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

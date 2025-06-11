import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCitizenCpf } from "@/http/citizen/citizen";
import { formatCpf } from "@/lib/format-cpf";
import { formatPhone } from "@/lib/format-phone";
import { getUserInfoFromToken } from "@/lib/user-info";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { SecondaryHeader } from "../../components/secondary-header";

export default async function PersonalInfoForm() {
  const userAuthInfo = await getUserInfoFromToken();
  let userInfo;
  if (userAuthInfo.cpf) {
    try {
      const response = await getCitizenCpf(userAuthInfo.cpf, {
        cache: "force-cache",
        next: { tags: ["update-user-email", "update-user-phone-number"] },
      });
      if (response.status === 200) {
        userInfo = response.data;
      } else {
        console.error("Failed to fetch user data status:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <>
      <div className="min-h-screen max-w-md mx-auto pt-24 pb-10 bg-background">
        <SecondaryHeader title="Informações pessoais" />
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-primary">
              CPF
            </Label>
            <Input
              id="cpf"
              defaultValue={formatCpf(userInfo?.cpf)}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-primary">
              Nome completo
            </Label>
            <Input
              id="fullName"
              defaultValue={userInfo?.nome || ""}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="socialName" className="text-primary">
                Nome social
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Nome pelo qual a pessoa prefere ser chamada socialmente
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="socialName"
              defaultValue={userInfo?.nome_social || ""}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-primary">
              Nacionalidade
            </Label>
            <Input
              id="nationality"
              defaultValue={userInfo?.nascimento?.pais || ""}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="race" className="text-primary">
              Raça / cor
            </Label>
            <Input
              id="race"
              defaultValue={userInfo?.raca || ""}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-primary">
              Data de nascimento
            </Label>
            <Input
              id="birthDate"
              defaultValue={formatDate(userInfo?.nascimento?.data)}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sexo" className="text-primary">
              Sexo
            </Label>
            <Input
              id="sexo"
              defaultValue={userInfo?.sexo || ""}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="celular" className="text-primary">
              Celular
            </Label>
          <Link
              href="/user-profile/user-personal-info/user-phone-number"
            >
            <Input
              id="celular"
              defaultValue={formatPhone(
                userInfo?.telefone?.principal?.ddi,
                userInfo?.telefone?.principal?.ddd,
                userInfo?.telefone?.principal?.valor
              )}
              className="bg-transparent border-muted text-foreground"
              readOnly
            />
          </Link>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-primary">
              E-mail
            </Label>
            <Link
              href="/user-profile/user-personal-info/user-email"
            >
              <Input
                id="email"
                defaultValue={userInfo?.email?.principal?.valor || ""}
                className="bg-transparent border-muted text-foreground"
                readOnly
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

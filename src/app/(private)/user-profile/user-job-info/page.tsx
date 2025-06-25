import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageFadeInWrapper } from '@/components/ui/page-fade-in'
import { SecondaryHeader } from '../../components/secondary-header'

export default function JobInfoForm() {
  return (
    <PageFadeInWrapper>
      <div className="min-h-screen max-w-md mx-auto pt-24 pb-10 bg-background">
        <SecondaryHeader title="Trabalho" />
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj_mei" className="text-primary">
              CNPJ (MEI)
            </Label>
            <Input
              id="cnpj_mei"
              defaultValue="12.345.678/0001-90"
              className="bg-transparent border-muted text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_empresarial" className="text-primary">
              Nome empresarial
            </Label>
            <Input
              id="nome_empresarial"
              defaultValue="João da Silva Serviços Digitais MEI"
              className="bg-transparent border-muted text-foreground"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="nome_fantasia" className="text-primary">
                Silva Soluções Web
              </Label>
            </div>
            <Input
              id="nome_fantasia"
              defaultValue="Silva Soluções Web"
              className="bg-transparent border-muted text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="atividade" className="text-primary">
              Atividades
            </Label>
            <Input
              id="atividade1"
              defaultValue="6201-5/01 – Desenvolvimento de programas de computador sob encomenda"
              className="bg-transparent border-muted text-foreground"
            />
            <Input
              id="atividade2"
              defaultValue="6311-9/00 – Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet"
              className="bg-transparent border-muted text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="situacao_cadastral" className="text-primary">
              Situação Cadastral
            </Label>
            <Input
              id="situacao_cadastral"
              defaultValue="Ativa"
              className="bg-transparent border-muted text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="text-primary">
              Endereço
            </Label>
            <Input
              id="endereco"
              defaultValue="Rua das Acácias, 123 – Sala 2
Bairro Jardim das Flores
CEP 01234-567
Rio de Janeiro"
              className="bg-transparent border-muted text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-primary">
              Descricão
            </Label>
            <Input
              id="descricao"
              defaultValue="Forneça uma breve descrição"
              className="bg-transparent border-muted text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio" className="text-primary">
              Portifólio
            </Label>
            <Input
              id="portfolio"
              defaultValue="Insira o link do seu portifólio"
              className="bg-transparent border-muted text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arquivos_upload" className="text-primary">
              Arquivos
            </Label>
            <Input
              id="arquivos_upload"
              defaultValue="Selecione os arquivos para upload"
              className="bg-transparent border-muted text-foreground"
            />
          </div>
        </div>
      </div>
    </PageFadeInWrapper>
  )
}

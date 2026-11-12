import { MenuItem } from '@/components/ui/custom/menu-item'

export default function MeiMenuPage() {
  return (
    <div className="max-w-4xl mx-auto text-foreground pb-10">
      <div className="px-4 pt-3.4">
        <h1 className="text-3xl font-medium text-foreground pb-2 pt-4">Menu</h1>
        <MenuItem
          label="Minhas propostas"
          href="/servicos/mei/minhas-propostas"
          isFirst
        />
        <MenuItem label="Meu MEI" href="/servicos/mei/meu-mei" />
        <MenuItem label="FAQ" href="/servicos/mei/faq" isLast />
      </div>
    </div>
  )
}

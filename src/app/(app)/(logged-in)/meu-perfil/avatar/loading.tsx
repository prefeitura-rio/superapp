import { SecondaryHeader } from "@/app/components/secondary-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AvatarLoading() {
  return (
    <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Escolha seu avatar" route="/meu-perfil" className="max-w-xl" />
      
      {/* Loading Avatar Grid */}
      <div className="px-4">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 justify-items-center place-items-center">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-full md:max-w-24 xl:max-w-32 aspect-square rounded-full"
            />
          ))}
        </div>
        
        {/* Loading Save Button */}
        <div className="mt-10 md:mt-16 xl:mt-20">
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

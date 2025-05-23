'use client'

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface SecondaryHeaderProps {
  title: string;
}

export function SecondaryHeader({ title }: SecondaryHeaderProps) {
  const router = useRouter();
  return (
    <>
      <header className="p-4 pt-6 fixed top-0 flex items-center w-full justify-center max-w-md mx-auto z-50 bg-background text-white h-16">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 absolute left-4 flex items-center h-full"
        >
          <span className="flex items-center justify-center bg-muted rounded-full w-12 h-12">
            <ChevronLeft className="h-7 w-7" />
          </span>
        </button>
        <h1 className="text-xl font-medium w-full text-center flex items-center justify-center h-full">
          {title}
        </h1>
      </header>

      <div className="fixed top-16 w-full max-w-md mx-auto h-15 z-40 pointer-events-none">
        <div
          className="w-full h-full bg-background backdrop-blur-lg"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />
      </div>
    </>
  );
}

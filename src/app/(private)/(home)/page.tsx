"use client";

import { useEffect } from "react";
import { FloatNavigation } from "../components/float-navation";
import MainHeader from "../components/main-header";
import MostAccessedServiceCards from "../components/most-accessed-services-cards";
import SuggestionCards from "../components/suggestion-cards";
import CarteiraSection from "../components/wallet-section";

export default function Home() {
  useEffect(() => {
    fetch("/api/protected", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => console.log("Dados protegidos:", data));
  }, []);

  return (
    <main className="flex max-w-md mx-auto pt-15 flex-col bg-background text-white">
      <MainHeader />
      {/* Header */}
      <header className="p-5">
        <h1 className="text-2xl font-bold">Marina Duarte</h1>
      </header>

      {/* Suggestion Cards*/}
      <SuggestionCards />

      {/* Most Accessed Service Cards*/}
      <MostAccessedServiceCards />

      {/* Carteira section */}
      <CarteiraSection />

      <FloatNavigation />
    </main>
  );
}

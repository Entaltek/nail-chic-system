import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SimulationBanner } from "./SimulationBanner";
import { useUserStore } from "@/stores/userStore";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const simulatingAs = useUserStore((s) => s.simulatingAs);

  return (
    <div className="min-h-screen bg-background">
      <SimulationBanner />
      <AppSidebar />
      <main className={cn("md:ml-64 min-h-screen", simulatingAs && "pt-10")}>
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

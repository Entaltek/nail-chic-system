import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";

export function SimulationBanner() {
  const simulatingAs = useUserStore((s) => s.simulatingAs);
  const simulateAs = useUserStore((s) => s.simulateAs);

  // ✅ Calcular el nombre directo con primitivos, sin selector que retorne objeto
  const activeUserName = simulatingAs ? "Usuario Simulado" : "Admin (Tú)";

  if (!simulatingAs) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium shadow-lg">
      <Eye className="h-4 w-4" />
      <span>VISTA PREVIA — Viendo como: {activeUserName}</span>
      <Button
        size="sm"
        variant="secondary"
        className="h-7 text-xs"
        onClick={() => simulateAs(null)}
      >
        <X className="h-3 w-3 mr-1" />
        Volver a Admin
      </Button>
    </div>
  );
}

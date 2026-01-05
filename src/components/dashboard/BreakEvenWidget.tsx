import { Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BreakEvenWidgetProps {
  totalExpenses: number;
  averageTicket: number;
  completedServices: number;
}

export function BreakEvenWidget({
  totalExpenses,
  averageTicket,
  completedServices,
}: BreakEvenWidgetProps) {
  const requiredServices = Math.ceil(totalExpenses / averageTicket);
  const progress = Math.min((completedServices / requiredServices) * 100, 100);
  const remaining = Math.max(requiredServices - completedServices, 0);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Punto de Equilibrio</h3>
          <p className="text-xs text-muted-foreground">Meta mensual de servicios</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-foreground">{requiredServices}</p>
            <p className="text-sm text-muted-foreground">servicios necesarios</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completedServices}</p>
            <p className="text-sm text-muted-foreground">completados</p>
          </div>
        </div>

        <Progress value={progress} className="h-3" />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {progress.toFixed(0)}% de la meta
          </span>
          {remaining > 0 ? (
            <span className="text-accent font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Faltan {remaining} servicios
            </span>
          ) : (
            <span className="text-green-600 font-medium">¡Meta alcanzada! 🎉</span>
          )}
        </div>
      </div>
    </div>
  );
}

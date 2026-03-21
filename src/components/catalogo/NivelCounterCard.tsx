import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NivelDiseno, NivelCounter } from "@/types/diseno.types";

interface NivelCounterCardProps {
  nivel: NivelDiseno;
  counter: NivelCounter;
  isActive: boolean;
  onClick: (nivel: NivelDiseno) => void;
}

export const getComplexityVisuals = (nivel: string) => {
  switch (nivel) {
    case "basico":
      return { label: "Básico", color: "bg-green-100 text-green-700 hover:bg-green-200" };
    case "intermedio":
      return { label: "Intermedio", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" };
    case "avanzado":
      return { label: "Avanzado", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" };
    case "experto":
      return { label: "Experto", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" };
    default:
      return { label: "N/A", color: "bg-muted text-muted-foreground hover:bg-muted" };
  }
};

export const NivelCounterCard = ({ nivel, counter, isActive, onClick }: NivelCounterCardProps) => {
  const { label, color } = getComplexityVisuals(nivel);
  


  return (
    <Card 
      className={`shadow-card cursor-pointer transition-all ${
        isActive ? "ring-2 ring-primary bg-primary/5" : "hover:border-primary/50"
      }`}
      onClick={() => onClick(nivel)}
    >
      <CardContent className="p-4 text-center">
        <Badge className={color}>{label}</Badge>
        <p className="text-2xl font-bold mt-2">
          {counter.count || 0}
        </p>
      </CardContent>
    </Card>
  );
};

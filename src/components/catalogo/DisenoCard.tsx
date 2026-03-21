import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, Edit2 } from "lucide-react";
import { Diseno } from "@/types/diseno.types";
import { getComplexityVisuals } from "./NivelCounterCard";

interface DisenoCardProps {
  diseno: Diseno;
  onEdit: (diseno: Diseno) => void;
  onDelete: (id: string) => void;
}

export const DisenoCard = ({ diseno, onEdit, onDelete }: DisenoCardProps) => {
  const { label, color } = getComplexityVisuals(diseno.nivel);

  const formattedPrice = diseno.precio_cobrado !== null
    ? new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      }).format(diseno.precio_cobrado)
    : "—";

  return (
    <Card className="shadow-card overflow-hidden group">
      <div className="relative aspect-square">
        <img
          src={diseno.thumb_url || diseno.foto_url}
          alt="Diseño"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between">
          <div className="flex justify-end p-2 gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white text-zinc-800"
              onClick={() => onEdit(diseno)}
              title="Editar diseño"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(diseno.id)}
              title="Eliminar diseño"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Status badges */}
        <Badge className={`absolute top-2 left-2 ${color} pointer-events-none`}>
          {label}
        </Badge>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {diseno.tiempo_real_min || "—"} min
          </div>
          <span className="font-bold text-primary">
            {formattedPrice}
          </span>
        </div>
        {diseno.tags && diseno.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {diseno.tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal bg-zinc-100 text-zinc-600">
                {tag}
              </Badge>
            ))}
            {diseno.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs font-normal bg-zinc-100 text-zinc-600">
                +{diseno.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Diseno } from "@/types/diseno.types";
import { DisenoCard } from "./DisenoCard";
import { Card, CardContent } from "@/components/ui/card";

interface DisenoGridProps {
  disenos: Diseno[];
  loading: boolean;
  loadingMore: boolean;
  nextCursor: string | null;
  onLoadMore: () => void;
  onEdit: (diseno: Diseno) => void;
  onDelete: (id: string) => void;
}

export const DisenoGrid = ({
  disenos,
  loading,
  loadingMore,
  nextCursor,
  onLoadMore,
  onEdit,
  onDelete,
}: DisenoGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="shadow-card border-none animate-pulse">
            <div className="aspect-square bg-zinc-200 rounded-t-xl" />
            <CardContent className="p-3 bg-white">
              <div className="h-4 bg-zinc-200 rounded w-1/3 mb-2" />
              <div className="h-6 bg-zinc-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (disenos.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in bg-white rounded-xl shadow-sm border border-zinc-100">
        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-zinc-700">Tu catálogo está vacío</h3>
        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
          Sube fotos de tus diseños para crear un histórico de precios y organizar tu portafolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        {disenos.map((diseno) => (
          <DisenoCard
            key={diseno.id}
            diseno={diseno}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full md:w-auto min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando más...
              </>
            ) : (
              "Cargar más diseños"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

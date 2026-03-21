import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Palette, Plus, Filter, Loader2 } from "lucide-react";

import { useCatalogo } from "@/hooks/useCatalogo";
import { deleteDiseno } from "@/services/diseno.service";
import { NivelCounterCard } from "@/components/catalogo/NivelCounterCard";
import { DisenoGrid } from "@/components/catalogo/DisenoGrid";
import { NuevoDisenoModal } from "@/components/catalogo/NuevoDisenoModal";
import { NivelDiseno, Diseno } from "@/types/diseno.types";
import { toast } from "@/hooks/use-toast";

export default function CatalogoDisenos() {
  const {
    disenos,
    counters,
    total,
    nextCursor,
    loading,
    loadingMore,
    filtroNivel,
    setFiltroNivel,
    loadMore,
    refetch,
  } = useCatalogo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disenoToEdit, setDisenoToEdit] = useState<Diseno | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper arrays to map levels easily
  const levelKeys: NivelDiseno[] = ["basico", "intermedio", "avanzado", "experto"];

  const handleOpenCreateModal = () => {
    setDisenoToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (diseno: Diseno) => {
    setDisenoToEdit(diseno);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteDiseno(deleteId);
      toast({
        title: "Diseño eliminado",
        description: "El diseño ha sido removido del catálogo.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleLevelClick = (nivel: NivelDiseno) => {
    // Toggle functionality
    if (filtroNivel === nivel) {
      setFiltroNivel("all"); // Equivalent to clearing the filter or 'all'
    } else {
      setFiltroNivel(nivel);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              Catálogo de Diseños
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Tu portafolio inteligente con histórico de precios
            </p>
          </div>
          <Button className="shadow-button w-full sm:w-auto font-medium" onClick={handleOpenCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Diseño
          </Button>
        </div>

        {/* Counters by Level */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {levelKeys.map((nivel) => {
            const counterData = counters?.[nivel] || { count: 0, precio_promedio: null };
            return (
              <NivelCounterCard
                key={nivel}
                nivel={nivel}
                counter={counterData}
                isActive={filtroNivel === nivel}
                onClick={handleLevelClick}
              />
            );
          })}
        </div>

        {/* Filter and Total Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-border/40 animate-fade-in">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select 
              value={filtroNivel || "all"} 
              onValueChange={(val) => setFiltroNivel(val)}
            >
              <SelectTrigger className="w-full sm:w-48 bg-white border-zinc-200">
                <SelectValue placeholder="Filtrar por nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="basico">Nivel Básico</SelectItem>
                <SelectItem value="intermedio">Nivel Intermedio</SelectItem>
                <SelectItem value="avanzado">Nivel Avanzado</SelectItem>
                <SelectItem value="experto">Nivel Experto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm font-medium text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
            {total} {total === 1 ? 'diseño en total' : 'diseños en total'}
          </span>
        </div>

        {/* Main Grid */}
        <DisenoGrid
          disenos={disenos}
          loading={loading}
          loadingMore={loadingMore}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          onEdit={handleOpenEditModal}
          onDelete={setDeleteId}
        />
        
      </div>

      {/* Creation / Edit Modal */}
      <NuevoDisenoModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        disenoEdit={disenoToEdit}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este diseño?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El diseño será removido permanentemente de tu catálogo y no se contemplará en tus promedios de precio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }} 
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar diseño"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </MainLayout>
  );
}

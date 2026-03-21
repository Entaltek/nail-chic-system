import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, DollarSign, Upload, X, Star, Loader2 } from "lucide-react";
import { NivelDiseno, Diseno } from "@/types/diseno.types";
import { getComplexityVisuals } from "./NivelCounterCard";
import { toast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";

interface NuevoDisenoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disenoEdit?: Diseno | null;
  onSuccess: () => void;
}

const levels: NivelDiseno[] = ["basico", "intermedio", "avanzado", "experto"];

export const NuevoDisenoModal = ({
  isOpen,
  onOpenChange,
  disenoEdit,
  onSuccess,
}: NuevoDisenoModalProps) => {
  const [preview, setPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nivel, setNivel] = useState<NivelDiseno>("basico");
  const [tiempoReal, setTiempoReal] = useState<string>("");
  const [precio, setPrecio] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (disenoEdit) {
        setPreview(disenoEdit.foto_url);
        setSelectedFile(null);
        setNivel(disenoEdit.nivel);
        setTiempoReal(disenoEdit.tiempo_real_min?.toString() || "");
        setPrecio(disenoEdit.precio_cobrado?.toString() || "");
        setTags(disenoEdit.tags ? disenoEdit.tags.join(", ") : "");
      } else {
        setPreview("");
        setSelectedFile(null);
        setNivel("basico");
        setTiempoReal("");
        setPrecio("");
        setTags("");
      }
    }
  }, [isOpen, disenoEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La imagen no debe superar los 15MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!disenoEdit && !selectedFile) {
      toast({ title: "Error", description: "Selecciona una foto para el diseño", variant: "destructive" });
      return;
    }
    if (!nivel) {
      toast({ title: "Error", description: "Selecciona el nivel de complejidad", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) formData.append("foto", selectedFile);
      formData.append("nivel", nivel);
      if (tiempoReal) formData.append("tiempo_real_min", tiempoReal.toString());
      if (precio) formData.append("precio_cobrado", precio.toString());
      if (tags) formData.append("tags", tags);

      // Obtener el token directamente
      const user = getAuth().currentUser;
      if (!user) throw new Error("No autenticado");
      const token = await user.getIdToken();

      const VITE_API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      const url = disenoEdit 
        ? `${VITE_API_URL}/disenos/${disenoEdit.id}` 
        : `${VITE_API_URL}/disenos`;
      const method = disenoEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.status === 1) {
        toast({ title: "Éxito", description: disenoEdit ? "Diseño actualizado" : "Diseño agregado al catálogo" });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Error al guardar el diseño", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{disenoEdit ? "Editar Diseño" : "Nuevo Diseño"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label>Foto del Diseño {(!disenoEdit) && <span className="text-destructive">*</span>}</Label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="relative group rounded-xl overflow-hidden border border-zinc-200">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview("");
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Reemplazar imagen
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-48 border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-zinc-700">Haz clic para subir imagen</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WEBP (máx. 15MB)</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nivel de Complejidad <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {levels.map((lvl, index) => {
                const { label } = getComplexityVisuals(lvl);
                const isActive = nivel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setNivel(lvl)}
                    className={`p-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      isActive ? "border-primary bg-primary/10 ring-1 ring-primary/20" : "border-border hover:border-primary/50 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex">
                      {[...Array(index + 1)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${isActive ? 'text-primary fill-primary' : 'text-zinc-400 fill-zinc-400'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-zinc-600'}`}>{label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-zinc-700"><Clock className="h-4 w-4 text-zinc-400" />Tiempo (min)</Label>
              <Input type="number" value={tiempoReal} onChange={(e) => setTiempoReal(e.target.value)} placeholder="Ej. 90" className="bg-zinc-50" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-zinc-700"><DollarSign className="h-4 w-4 text-zinc-400" />Precio ($)</Label>
              <Input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej. 850" className="bg-zinc-50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700">Tags (separados por coma)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ej. francés, degradado, minimalista" className="bg-zinc-50" />
          </div>

          <div className="pt-4">
            <Button onClick={handleSubmit} className="w-full shadow-button" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : disenoEdit ? "Guardar Cambios" : "Agregar al Catálogo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

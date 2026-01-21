import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Plus,
  Clock,
  DollarSign,
  Star,
  Image as ImageIcon,
  Upload,
  Trash2,
  X,
  Filter,
} from "lucide-react";
import { useBusinessConfig, DesignItem } from "@/stores/businessConfig";
import { toast } from "@/hooks/use-toast";

export default function CatalogoDisenos() {
  const { designs, addDesign, removeDesign } = useBusinessConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [newDesign, setNewDesign] = useState({
    imageUrl: "",
    complexityLevel: "2" as string,
    realMinutes: "",
    chargedPrice: "",
    tags: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo, create a local URL (in production, upload to storage)
      const url = URL.createObjectURL(file);
      setNewDesign({ ...newDesign, imageUrl: url });
    }
  };

  const handleAddDesign = () => {
    if (!newDesign.imageUrl || !newDesign.realMinutes || !newDesign.chargedPrice) {
      toast({
        title: "Campos requeridos",
        description: "Imagen, tiempo y precio son obligatorios",
        variant: "destructive",
      });
      return;
    }

    addDesign({
      imageUrl: newDesign.imageUrl,
      complexityLevel: parseInt(newDesign.complexityLevel) as 1 | 2 | 3 | 4,
      realMinutes: parseInt(newDesign.realMinutes),
      chargedPrice: parseFloat(newDesign.chargedPrice),
      tags: newDesign.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    setNewDesign({
      imageUrl: "",
      complexityLevel: "2",
      realMinutes: "",
      chargedPrice: "",
      tags: "",
    });
    setIsDialogOpen(false);

    toast({
      title: "¡Diseño agregado! 🎨",
      description: "Ya puedes usarlo como referencia de precios",
    });
  };

  const getComplexityLabel = (level: number) => {
    switch (level) {
      case 1: return { label: "Básico", color: "bg-green-100 text-green-700" };
      case 2: return { label: "Intermedio", color: "bg-blue-100 text-blue-700" };
      case 3: return { label: "Avanzado", color: "bg-purple-100 text-purple-700" };
      case 4: return { label: "Experto", color: "bg-accent text-accent-foreground" };
      default: return { label: "N/A", color: "bg-muted text-muted-foreground" };
    }
  };

  // Filter designs
  const filteredDesigns = filterLevel === "all" 
    ? designs 
    : designs.filter((d) => d.complexityLevel.toString() === filterLevel);

  // Stats
  const avgPriceByLevel = [1, 2, 3, 4].map((level) => {
    const levelDesigns = designs.filter((d) => d.complexityLevel === level);
    const avg = levelDesigns.length > 0
      ? levelDesigns.reduce((sum, d) => sum + d.chargedPrice, 0) / levelDesigns.length
      : 0;
    return { level, avg, count: levelDesigns.length };
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              Catálogo de Diseños
            </h1>
            <p className="text-muted-foreground mt-1">
              Tu portafolio inteligente con histórico de precios
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-button">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Diseño
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Diseño</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Foto del Diseño</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {newDesign.imageUrl ? (
                    <div className="relative">
                      <img
                        src={newDesign.imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => setNewDesign({ ...newDesign, imageUrl: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clic para subir imagen
                      </p>
                    </div>
                  )}
                </div>

                {/* Complexity Level */}
                <div className="space-y-2">
                  <Label>Nivel de Complejidad</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((level) => {
                      const { label, color } = getComplexityLabel(level);
                      return (
                        <button
                          key={level}
                          onClick={() => setNewDesign({ ...newDesign, complexityLevel: level.toString() })}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            newDesign.complexityLevel === level.toString()
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-center mb-1">
                            {[...Array(level)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-accent fill-accent" />
                            ))}
                          </div>
                          <p className="text-xs font-medium">{label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Tiempo Real (min)
                    </Label>
                    <Input
                      type="number"
                      value={newDesign.realMinutes}
                      onChange={(e) => setNewDesign({ ...newDesign, realMinutes: e.target.value })}
                      placeholder="90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Precio Cobrado
                    </Label>
                    <Input
                      type="number"
                      value={newDesign.chargedPrice}
                      onChange={(e) => setNewDesign({ ...newDesign, chargedPrice: e.target.value })}
                      placeholder="850"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags (separados por coma)</Label>
                  <Input
                    value={newDesign.tags}
                    onChange={(e) => setNewDesign({ ...newDesign, tags: e.target.value })}
                    placeholder="francés, degradado, navidad"
                  />
                </div>

                <Button onClick={handleAddDesign} className="w-full">
                  Agregar al Catálogo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Price Reference by Level */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {avgPriceByLevel.map(({ level, avg, count }) => {
            const { label, color } = getComplexityLabel(level);
            return (
              <Card key={level} className="shadow-card">
                <CardContent className="p-4 text-center">
                  <Badge className={color}>{label}</Badge>
                  <p className="text-2xl font-bold mt-2">
                    {avg > 0 ? `$${avg.toFixed(0)}` : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count} diseños
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 animate-fade-in">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="1">Nivel 1 - Básico</SelectItem>
              <SelectItem value="2">Nivel 2 - Intermedio</SelectItem>
              <SelectItem value="3">Nivel 3 - Avanzado</SelectItem>
              <SelectItem value="4">Nivel 4 - Experto</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredDesigns.length} diseños
          </span>
        </div>

        {/* Gallery Grid */}
        {filteredDesigns.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Tu catálogo está vacío</h3>
            <p className="text-muted-foreground mt-1">
              Sube fotos de tus diseños para crear un histórico de precios
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {filteredDesigns.map((design) => {
              const { label, color } = getComplexityLabel(design.complexityLevel);
              return (
                <Card key={design.id} className="shadow-card overflow-hidden group">
                  <div className="relative aspect-square">
                    <img
                      src={design.imageUrl}
                      alt="Diseño"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removeDesign(design.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className={`absolute top-2 left-2 ${color}`}>
                      {label}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {design.realMinutes} min
                      </div>
                      <span className="font-bold text-primary">
                        ${design.chargedPrice}
                      </span>
                    </div>
                    {design.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {design.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {design.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{design.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SuperCategory } from "@/stores/businessConfig";

const colorOptions = [
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-purple-500", label: "Púrpura" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-rose-400", label: "Rosa Intenso" },
  { value: "bg-amber-500", label: "Ámbar" },
  { value: "bg-teal-500", label: "Verde Azulado" },
  { value: "bg-emerald-500", label: "Esmeralda" },
  { value: "bg-red-500", label: "Rojo" },
  { value: "bg-indigo-500", label: "Índigo" },
  { value: "bg-cyan-500", label: "Cian" },
];

const emojiOptions = [
  "🔵", "🟣", "✨", "🎨", "🛠", "💎", "🧴", "📦", "💅", "🧤",
  "🌟", "🔧", "🎀", "💄", "🧪", "⚡", "🪥", "🎯",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SuperCategory | null;
  onSave: (data: Omit<SuperCategory, "id">) => void;
}

export function SuperCategoryFormDialog({ open, onOpenChange, editing, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    emoji: "📦",
  });

  useEffect(() => {
    if (editing) {
      setFormData({
        name: editing.name,
        description: editing.description,
        color: editing.color,
        emoji: editing.emoji,
      });
    } else {
      setFormData({ name: "", description: "", color: "bg-blue-500", emoji: "📦" });
    }
  }, [editing, open]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar Super Categoría" : "Nueva Super Categoría"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Herramientas Eléctricas"
              />
            </div>
            <div>
              <Label>Emoji</Label>
              <Select
                value={formData.emoji}
                onValueChange={(v) => setFormData({ ...formData, emoji: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emojiOptions.map((emoji) => (
                    <SelectItem key={emoji} value={emoji}>
                      <span className="text-xl">{emoji}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Color de Etiqueta</Label>
            <Select
              value={formData.color}
              onValueChange={(v) => setFormData({ ...formData, color: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${color.value}`} />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descripción</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descripción de esta super categoría"
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            {editing ? "Guardar Cambios" : "Crear Super Categoría"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

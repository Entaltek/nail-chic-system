import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Settings2,
  Users,
  Trash2,
  Plus,
  Sparkles,
  Palette,
  Building2,
  Shield,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/hooks/use-toast";
import { teamMemberService, TeamMember } from "@/services/teamMemberService";
import { PermissionsPanel } from "@/components/configuracion/PermissionsPanel";

export default function ConfiguracionMaestra() {
  const { theme, toggleTheme } = useTheme();
  const [equipo, setEquipo] = useState<TeamMember[]>([]);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", rol: "empleada", comision_pct: 40 });

  const fetchEquipo = async () => {
    try {
      const data = await teamMemberService.getAll();
      setEquipo(data.filter((m: any) => m.isActive));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchEquipo();
  }, []);

  const handleAgregar = async () => {
    if (!form.nombre) {
      toast({ title: "Nombre requerido", variant: "destructive" });
      return;
    }
    try {
      await teamMemberService.create({
        name: form.nombre,
        role: form.rol === "duena" ? "owner" : "employee",
        commissionPercentage: form.rol === "duena" ? null : form.comision_pct,
      });
      setForm({ nombre: "", rol: "empleada", comision_pct: 40 });
      setIsTeamDialogOpen(false);
      toast({ title: "¡Miembro del equipo agregado! 👩‍🎨" });
      fetchEquipo();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await teamMemberService.delete(id);
      toast({ title: "Miembro del equipo eliminado" });
      fetchEquipo();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            Configuración
          </h1>
          <p className="text-muted-foreground mt-1">
            Personaliza tu sistema Entaltek
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="permisos" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Equipo y Permisos
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Theme Toggle */}
            <Card className="shadow-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Tema Visual
                </CardTitle>
                <CardDescription>
                  Cambia entre el tema Girly y el tema Corporativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Tema Corporativo Entaltek
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Azul Brillante + Azul Marino + Tipografía Sansation
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'corporate'}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                {/* Theme Preview */}
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">
                    Vista previa del tema activo
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg bg-primary shadow-button" />
                      <span className="text-xs text-muted-foreground">Primario</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg bg-secondary" />
                      <span className="text-xs text-muted-foreground">Secundario</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg bg-accent" />
                      <span className="text-xs text-muted-foreground">Acento</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border" />
                      <span className="text-xs text-muted-foreground">Muted</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mt-3 font-medium">
                    {theme === 'corporate'
                      ? '🏢 Tema Corporativo: Azul Brillante + Azul Marino + Sansation'
                      : '💅 Tema Girly: Magenta + Plum + Quicksand'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Equipo de Trabajo
                  </CardTitle>
                  <CardDescription>
                    Configura las comisiones de tu equipo
                  </CardDescription>
                </div>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nueva Integrante del Equipo</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-2">
                      
                      {/* Nombre */}
                      <div className="space-y-1">
                        <Label>Nombre completo *</Label>
                        <Input 
                          placeholder="Ej. María García"
                          value={form.nombre}
                          onChange={e => setForm({...form, nombre: e.target.value})}
                        />
                      </div>

                      {/* Rol */}
                      <div className="space-y-1">
                        <Label>Rol</Label>
                        <Select 
                          value={form.rol} 
                          onValueChange={v => setForm({...form, rol: v})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="empleada">Empleada</SelectItem>
                            <SelectItem value="duena">Dueña</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Comisión */}
                      {form.rol === 'empleada' && (
                        <div className="space-y-2 mt-4">
                          <Label>Comisión de la empleada: {form.comision_pct}%</Label>
                          <Slider
                            min={0} max={100} step={5}
                            value={[form.comision_pct]}
                            onValueChange={([v]) => setForm({...form, comision_pct: v})}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Empleada recibe: {form.comision_pct}%</span>
                            <span>Estudio recibe: {100 - form.comision_pct}%</span>
                          </div>
                        </div>
                      )}

                      <Button onClick={handleAgregar} className="w-full mt-4">
                        Agregar al Equipo
                      </Button>

                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipo.map(miembro => (
                    <div key={miembro.id}
                         className="flex items-center justify-between p-3 
                                    rounded-lg border bg-muted/10">
                      
                      {/* Avatar + info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          miembro.role === 'owner' ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                        }`}>
                          {miembro.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{miembro.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {miembro.role === 'owner' ? '👑 Dueña' : '💅 Empleada'}
                          </p>
                        </div>
                      </div>

                      {/* Comisión + acciones */}
                      <div className="flex items-center gap-3">
                        {miembro.role === 'employee' && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Comisión</p>
                            <p className="font-bold text-sm text-primary">
                              {miembro.commissionPercentage ?? 0}%
                            </p>
                          </div>
                        )}
                        
                        {/* No permitir eliminar a la dueña */}
                        {miembro.role !== 'owner' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Eliminar a {miembro.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará del equipo. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground hover:text-destructive-foreground focus:ring-destructive"
                                  onClick={() => handleEliminar(miembro.id)}
                                >
                                  Sí, eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permisos" className="mt-6">
            <PermissionsPanel />
          </TabsContent>
        </Tabs>

        {/* About */}
        <div className="text-center py-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Entaltek v1.0</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Hecho con 💅 para emprendedoras que brillan
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

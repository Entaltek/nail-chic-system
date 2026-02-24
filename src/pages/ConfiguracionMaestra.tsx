import { useState } from "react";
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
import { useBusinessConfig } from "@/stores/businessConfig";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/hooks/use-toast";
import { PermissionsPanel } from "@/components/configuracion/PermissionsPanel";

export default function ConfiguracionMaestra() {
  const { theme, toggleTheme } = useTheme();
  const {
    teamMembers,
    addTeamMember,
    removeTeamMember,
  } = useBusinessConfig();

  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", commissionPercent: "40" });

  const handleAddTeamMember = () => {
    if (!newMember.name) {
      toast({ title: "Nombre requerido", variant: "destructive" });
      return;
    }
    addTeamMember({
      name: newMember.name,
      role: 'employee',
      commissionPercent: parseFloat(newMember.commissionPercent) || 40,
      isActive: true,
    });
    setNewMember({ name: "", commissionPercent: "40" });
    setIsTeamDialogOpen(false);
    toast({ title: "¡Miembro del equipo agregado! 👩‍🎨" });
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nueva Empleada</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Nombre</Label>
                        <Input
                          value={newMember.name}
                          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                          placeholder="Ej. María"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Comisión para empleada: {newMember.commissionPercent}%</Label>
                        <Slider
                          value={[parseFloat(newMember.commissionPercent) || 40]}
                          onValueChange={([value]) => setNewMember({ ...newMember, commissionPercent: value.toString() })}
                          min={20}
                          max={70}
                          step={5}
                        />
                        <p className="text-xs text-muted-foreground">
                          Estudio recibe: {100 - (parseFloat(newMember.commissionPercent) || 40)}%
                        </p>
                      </div>
                      <Button onClick={handleAddTeamMember} className="w-full">
                        Agregar al Equipo
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          member.role === 'owner' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.role === 'owner' ? 'Dueña' : 'Empleada'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.role === 'employee' && (
                          <>
                            <div className="text-right">
                              <p className="font-bold">{member.commissionPercent}%</p>
                              <p className="text-xs text-muted-foreground">comisión</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeTeamMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {member.role === 'owner' && (
                          <Sparkles className="h-5 w-5 text-primary" />
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

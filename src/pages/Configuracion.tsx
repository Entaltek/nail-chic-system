import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Store,
  Palette,
  Bell,
  Shield,
  Sparkles,
} from "lucide-react";

export default function Configuracion() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Configuración
          </h1>
          <p className="text-muted-foreground mt-1">
            Personaliza tu sistema Entaltek
          </p>
        </div>

        {/* Business Info */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Información del Negocio
            </CardTitle>
            <CardDescription>
              Datos básicos de tu salón de uñas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Salón</Label>
                <Input defaultValue="Entaltek Nail Studio" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input defaultValue="+52 55 1234 5678" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input defaultValue="Av. Reforma 123, CDMX" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Apariencia
            </CardTitle>
            <CardDescription>
              Personaliza el aspecto visual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema Oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Activa el modo oscuro para reducir fatiga visual
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Transiciones suaves en la interfaz
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura tus alertas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stock Bajo</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas cuando un insumo esté por agotarse
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resumen Semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe un reporte de tu semana cada domingo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Protege tu cuenta y datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cambiar Contraseña</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="Nueva contraseña" />
                <Button variant="outline">Actualizar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

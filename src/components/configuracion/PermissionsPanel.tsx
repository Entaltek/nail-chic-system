import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Save, Eye } from "lucide-react";
import { APP_MODULES, AppModuleId, useUserStore } from "@/stores/userStore";
import { toast } from "@/hooks/use-toast";

export function PermissionsPanel() {
  const { users, updateUserPermissions, simulateAs, simulatingAs } = useUserStore();
  const staffUsers = users.filter((u) => u.role === "staff");

  const [selectedUserId, setSelectedUserId] = useState<string>(
    staffUsers[0]?.id ?? ""
  );
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const [localPerms, setLocalPerms] = useState<AppModuleId[]>(
    selectedUser?.permissions ?? []
  );

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u.id === userId);
    setLocalPerms(user?.permissions ?? []);
  };

  const toggleModule = (moduleId: AppModuleId) => {
    setLocalPerms((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSave = () => {
    updateUserPermissions(selectedUserId, localPerms);
    toast({ title: "Permisos actualizados ✅" });
  };

  const handleSimulate = () => {
    if (simulatingAs === selectedUserId) {
      simulateAs(null);
    } else {
      simulateAs(selectedUserId);
    }
  };

  if (staffUsers.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No hay miembros del equipo. Agrega uno en la pestaña General.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Selector */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestión de Permisos
          </CardTitle>
          <CardDescription>
            Selecciona un usuario para configurar qué módulos puede ver
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Seleccionar usuario</Label>
            <Select value={selectedUserId} onValueChange={handleUserChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Elegir usuario..." />
              </SelectTrigger>
              <SelectContent>
                {staffUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Module Switches */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            Módulos visibles para{" "}
            <span className="text-primary">{selectedUser?.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {APP_MODULES.map((mod) => {
              const isOn = localPerms.includes(mod.id);
              const isConfig = mod.id === "configuracion";
              return (
                <div
                  key={mod.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{mod.label}</span>
                  <Switch
                    checked={isOn}
                    disabled={isConfig}
                    onCheckedChange={() => toggleModule(mod.id)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
            <Button variant="outline" onClick={handleSimulate}>
              <Eye className="h-4 w-4 mr-2" />
              {simulatingAs === selectedUserId ? "Dejar simulación" : `Simular vista`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

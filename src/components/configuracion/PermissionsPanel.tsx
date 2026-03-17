import { useState, useEffect } from "react";
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
import { Shield, Save, Eye, Loader2 } from "lucide-react";
import { APP_MODULES, AppModuleId, useUserStore } from "@/stores/userStore";
import { toast } from "@/hooks/use-toast";
import { getUsers, getUserPermissions, updateUserPermissions, AuthUser } from "@/services/userPermissionService";

export function PermissionsPanel() {
  const { simulateAs, simulatingAs } = useUserStore();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        if (data.length > 0) {
          setSelectedUserId(data[0].uid);
          loadUserPermissions(data[0].uid);
        }
      } catch (error) {
        toast({ title: "Error al cargar usuarios", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const loadUserPermissions = async (userId: string) => {
    try {
      const data = await getUserPermissions(userId);
      if (data && data.modules) {
        setLocalPerms(data.modules);
      } else {
        // Default all to false if no permissions found
        const defaults: Record<string, boolean> = {};
        APP_MODULES.forEach(mod => {
          defaults[mod.id] = false;
        });
        setLocalPerms(defaults);
      }
    } catch (error) {
      toast({ title: "Error al cargar permisos", variant: "destructive" });
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    loadUserPermissions(userId);
  };

  const toggleModule = (moduleId: string) => {
    setLocalPerms((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSave = async () => {
    const user = users.find(u => u.uid === selectedUserId);
    if (!user) return;

    setSaving(true);
    try {
      await updateUserPermissions(selectedUserId, user.email, localPerms, user.displayName || undefined);
      toast({ title: "Permisos actualizados ✅" });
    } catch (error) {
      toast({ title: "Error al guardar permisos", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSimulate = () => {
    if (simulatingAs === selectedUserId) {
      simulateAs(null);
    } else {
      simulateAs(selectedUserId);
      // We need to set the allowedModules in the store for simulation to work
      useUserStore.getState().setAllowedModules(localPerms);
    }
  };

  const selectedUser = users.find((u) => u.uid === selectedUserId);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No hay otros usuarios registrados en el sistema.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestión de Permisos
          </CardTitle>
          <CardDescription>
            Configura el acceso a módulos para cada usuario del equipo
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
                {users.map((u) => (
                  <SelectItem key={u.uid} value={u.uid}>
                    {u.displayName || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            Módulos visibles para{" "}
            <span className="text-primary">{selectedUser?.displayName || selectedUser?.email}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {APP_MODULES.map((mod) => {
              const isOn = !!localPerms[mod.id];
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
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
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

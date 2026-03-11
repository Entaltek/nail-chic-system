import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Phone,
  Check,
  X,
  Crown,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import logoEntaltek from "@/assets/logo_entaltek.png";
import { createUserWithEmailAndPassword, type AuthError } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig";

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

const registerSchema = z.object({
  nombres: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .regex(nameRegex, "Solo letras"),
  apellidoPaterno: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .regex(nameRegex, "Solo letras"),
  apellidoMaterno: z
    .string()
    .regex(nameRegex, "Solo letras")
    .or(z.literal(""))
    .optional(),
  correo: z.string().email("Ingresa un correo válido"),
  telefono: z
    .string()
    .min(10, "Mínimo 10 dígitos")
    .max(15, "Máximo 15 dígitos")
    .regex(/^\d+$/, "Solo números"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[0-9]/, "Debe contener al menos un dígito")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Debe contener un carácter especial"),
  esDueno: z.boolean().optional(),
  aceptaTerminos: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos" }),
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function formatName(value: string) {
  return value
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

interface PasswordCheck {
  label: string;
  met: boolean;
}

function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Al menos un dígito", met: /[0-9]/.test(password) },
    {
      label: "Un carácter especial",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError, // 👈 agrégalo aquí
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      correo: "",
      telefono: "",
      password: "",
      esDueno: false,
      aceptaTerminos: undefined,
    },
  });

  const passwordValue = watch("password") || "";
  const passwordChecks = getPasswordChecks(passwordValue);
  const aceptaTerminos = watch("aceptaTerminos");
  const esDueno = watch("esDueno");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // 1) Crear usuario en Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, data.correo, data.password);

      // Esperar a que el token esté disponible
      await cred.user.getIdToken();

      // 2) Crear documento del usuario en Firestore (users/{uid})
      await setDoc(doc(db, "users", cred.user.uid), {
        email: data.correo,
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno ?? "",
        telefono: data.telefono,
        role: data.esDueno ? "owner" : "employee",
        createdAt: serverTimestamp(),
        config: {
          monthlyWorkHours: 0,
          desiredMonthlySalary: 0,
          includeAguinaldo: false,
          annualInsurance: 0,
        },
      });

      // ✅ Ya queda logueado automáticamente
      navigate("/", { replace: true });

      // Si prefieres mandarlo al login con email prellenado, usa esto en vez de lo de arriba:
      // navigate(`/login?email=${encodeURIComponent(data.correo)}`, { replace: true });

    } catch (error) {
      const e = error as AuthError;

      switch (e.code) {
        case "auth/email-already-in-use":
          setError("correo", { type: "manual", message: "Este correo ya está registrado" });
          break;
        case "auth/invalid-email":
          setError("correo", { type: "manual", message: "Correo inválido" });
          break;
        case "auth/weak-password":
          setError("password", { type: "manual", message: "Contraseña débil. Intenta otra." });
          break;
        case "auth/network-request-failed":
          setAuthError("Error de conexión. Revisa tu internet.");
          break;
        case "permission-denied":
          setAuthError("Firestore rechazó permisos. Revisa las Rules de Firestore.");
          break;
        default:
          setAuthError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isEntaltek = theme === "corporate";

  const inputStyle = {
    background: "var(--login-input-bg)",
    border: "var(--login-input-border)",
    color: "hsl(var(--login-text))",
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center overflow-auto py-8"
      style={{
        background: "var(--login-bg-gradient)",
        color: "hsl(var(--login-text))",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: `hsl(var(--primary))`, top: "10%", left: "15%" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: `hsl(var(--accent))`, bottom: "10%", right: "10%" }}
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Theme toggle */}
      <motion.div
        className="absolute top-6 right-6 flex items-center gap-3 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-xs font-medium opacity-70">
          {isEntaltek ? "Entaltek" : "Naila Art"}
        </span>
        <Switch
          checked={isEntaltek}
          onCheckedChange={toggleTheme}
          className="data-[state=checked]:bg-primary/30 data-[state=unchecked]:bg-black/10"
        />
      </motion.div>

      {/* Glass card */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-4"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: "var(--login-glass-bg)",
            border: "var(--login-glass-border)",
            boxShadow: "var(--login-glass-shadow)",
          }}
        >
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {isEntaltek ? (
              <img src={logoEntaltek} alt="Entaltek" className="h-14 w-14 object-contain mb-2" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/40 backdrop-blur-sm mb-2 shadow-lg border border-white/50">
                <span className="text-2xl">💅</span>
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-sm opacity-60 mt-1">
              {isEntaltek ? "Entaltek Business Suite" : "Naila Art Studio"}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre(s) - full width */}
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Label className="opacity-80 text-sm">Nombre(s) *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                <Input
                  {...register("nombres", {
                    onChange: (e) => {
                      const formatted = formatName(e.target.value);
                      setValue("nombres", formatted, { shouldValidate: true });
                    },
                  })}
                  placeholder="Ej. María Isabel"
                  className="pl-10 focus-visible:ring-primary/40"
                  style={inputStyle}
                />
              </div>
              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center font-medium border border-destructive/20"
                  >
                    {authError}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Grid 2 cols: apellidos */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-1.5">
                <Label className="opacity-80 text-sm">Apellido paterno *</Label>
                <Input
                  {...register("apellidoPaterno", {
                    onChange: (e) => {
                      const formatted = formatName(e.target.value);
                      setValue("apellidoPaterno", formatted, { shouldValidate: true });
                    },
                  })}
                  placeholder="Pérez"
                  className="focus-visible:ring-primary/40"
                  style={inputStyle}
                />
                <AnimatePresence>
                  {errors.apellidoPaterno && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive font-medium">
                      {errors.apellidoPaterno.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-1.5">
                <Label className="opacity-80 text-sm">Apellido materno</Label>
                <Input
                  {...register("apellidoMaterno", {
                    onChange: (e) => {
                      const formatted = formatName(e.target.value);
                      setValue("apellidoMaterno", formatted, { shouldValidate: true });
                    },
                  })}
                  placeholder="López"
                  className="focus-visible:ring-primary/40"
                  style={inputStyle}
                />
                <AnimatePresence>
                  {errors.apellidoMaterno && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive font-medium">
                      {errors.apellidoMaterno.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Grid 2 cols: correo + teléfono */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="space-y-1.5">
                <Label className="opacity-80 text-sm">Correo *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                  <Input
                    {...register("correo")}
                    type="email"
                    placeholder="tu@correo.com"
                    className="pl-10 focus-visible:ring-primary/40"
                    style={inputStyle}
                  />
                </div>
                <AnimatePresence>
                  {errors.correo && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive font-medium">
                      {errors.correo.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-1.5">
                <Label className="opacity-80 text-sm">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                  <Input
                    {...register("telefono")}
                    type="tel"
                    placeholder="5512345678"
                    className="pl-10 focus-visible:ring-primary/40"
                    style={inputStyle}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setValue("telefono", digits, { shouldValidate: true });
                    }}
                  />
                </div>
                <AnimatePresence>
                  {errors.telefono && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive font-medium">
                      {errors.telefono.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label className="opacity-80 text-sm">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 focus-visible:ring-primary/40"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength checks */}
              <div className="flex flex-col gap-1 pt-1">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2">
                    {check.met ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 opacity-30" />
                    )}
                    <span
                      className={`text-xs ${check.met ? "text-green-500" : "opacity-40"}`}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Checkboxes: Owner + T&C */}
            <motion.div
              className="space-y-3 pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {/* Owner checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="esDueno"
                  checked={esDueno || false}
                  onCheckedChange={(checked) =>
                    setValue("esDueno", checked === true, { shouldValidate: true })
                  }
                  className="border-current/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="esDueno" className="flex items-center gap-2 text-sm cursor-pointer opacity-80">
                  <Crown className="h-4 w-4" />
                  Soy dueño(a) del negocio
                </label>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="aceptaTerminos"
                  checked={aceptaTerminos === true}
                  onCheckedChange={(checked) =>
                    setValue("aceptaTerminos", checked === true ? true : (undefined as any), {
                      shouldValidate: true,
                    })
                  }
                  className="mt-0.5 border-current/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="aceptaTerminos" className="text-sm cursor-pointer opacity-80 leading-tight">
                  Acepto los{" "}
                  <button type="button" className="underline hover:opacity-100 transition-opacity font-medium">
                    términos y condiciones
                  </button>
                </label>
              </div>
              <AnimatePresence>
                {errors.aceptaTerminos && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive font-medium">
                    {errors.aceptaTerminos.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 disabled:opacity-40"
                style={{
                  background: isValid ? `hsl(var(--login-primary-btn))` : undefined,
                  color: isValid ? "white" : undefined,
                  boxShadow: isValid ? `0 4px 20px -4px hsl(var(--login-primary-btn) / 0.5)` : undefined,
                }}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta"}
              </Button>
            </motion.div>

            {/* Link to login */}
            <motion.p
              className="text-center text-sm opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold underline hover:opacity-100 transition-opacity"
              >
                Inicia sesión
              </button>
            </motion.p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

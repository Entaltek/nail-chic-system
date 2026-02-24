import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SplashScreen from "@/components/auth/SplashScreen";
import logoEntaltek from "@/assets/logo_entaltek.png";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (_data: LoginFormData) => {
    setIsLoading(true);
    // Simulate Firebase signInWithEmailAndPassword
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    navigate("/");
  };

  const isEntaltek = theme === "corporate";

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        ) : (
          <motion.div
            key="login"
            className="fixed inset-0 flex items-center justify-center overflow-hidden"
            style={{ 
              background: "var(--login-bg-gradient)",
              color: "hsl(var(--login-text))"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Floating orbs background */}
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
              className="relative z-10 w-full max-w-md mx-4"
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
                  className="flex flex-col items-center mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {isEntaltek ? (
                    <img
                      src={logoEntaltek}
                      alt="Entaltek"
                      className="h-16 w-16 object-contain mb-3"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40 backdrop-blur-sm mb-3 shadow-lg border border-white/50">
                      <span className="text-3xl">💅</span>
                    </div>
                  )}
                  <h1 className="text-2xl font-bold tracking-tight">
                    {isEntaltek ? "Entaltek" : "Naila Art"}
                  </h1>
                  <p className="text-sm opacity-60 mt-1">
                    {isEntaltek
                      ? "Business Suite"
                      : "Tu estudio, tu arte"}
                  </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label className="opacity-80 text-sm">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="tu@correo.com"
                        className="pl-10 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                        style={{
                          background: "var(--login-input-bg)",
                          border: "var(--login-input-border)",
                          color: "hsl(var(--login-text))"
                        }}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-destructive font-medium"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label className="opacity-80 text-sm">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                      <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                        style={{
                          background: "var(--login-input-bg)",
                          border: "var(--login-input-border)",
                          color: "hsl(var(--login-text))"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-destructive font-medium"
                        >
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Forgot password link */}
                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      type="button"
                      className="text-xs opacity-50 hover:opacity-80 transition-opacity"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </motion.div>

                  {/* Submit */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <Button
                      type="submit"
                      disabled={!isValid || isLoading}
                      className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 disabled:opacity-40"
                      style={{
                        background: isValid
                          ? `hsl(var(--login-primary-btn))`
                          : undefined,
                        color: isValid ? "white" : undefined,
                        boxShadow: isValid
                          ? `0 4px 20px -4px hsl(var(--login-primary-btn) / 0.5)`
                          : undefined,
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

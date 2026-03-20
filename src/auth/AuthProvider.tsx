import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { useUserStore } from "@/stores/userStore";

type AuthCtx = { user: User | null; loading: boolean };
const Ctx = createContext<AuthCtx>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentUser, resetPermissions } = useUserStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setCurrentUser(u.uid, u.email || undefined);
      } else {
        setUser(null);
        resetPermissions();
      }
      setLoading(false);
    });
    return () => unsub();
  }, [setCurrentUser, resetPermissions]);

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
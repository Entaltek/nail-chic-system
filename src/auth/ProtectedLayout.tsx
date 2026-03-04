import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return null; // o un loader/splash global
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
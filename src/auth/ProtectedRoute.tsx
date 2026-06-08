import { type ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./useAuth";
import Spinner from "../components/Spinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="page-spinner">
        <Spinner size={32} />
      </div>
    );

  // No user? redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // User authenticated → allow page
  return children;
}
// "rewrites": [{ "source": "/(.*)", "destination": "/" }],

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/ui.jsx';
export function RequireAuth({ children, admin }) {
  const { user, ready, isAdmin } = useAuth(); const loc = useLocation();
  if (!ready) return <Spinner className="py-32" />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (admin && !isAdmin) return <Navigate to="/portal" replace />;
  return children;
}

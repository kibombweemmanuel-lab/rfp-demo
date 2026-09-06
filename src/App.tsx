import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/context/AuthContext';
import Layout from './components/Layout';

export default function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div className="auth-loading">Restoring secure session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Layout><Outlet /></Layout>
  );
}
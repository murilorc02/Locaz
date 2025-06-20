import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const BusinessProtectedRoute = () => {
  const { user, isAuthenticated } = useAuth(); // Adicione isLoading se o seu AuthContext tiver
  
  // Verifica se o usuário está autenticado e é um 'business'
  const isBusinessUser = isAuthenticated && user?.role === 'business';

  // Se for um usuário de negócios, renderiza a página solicitada (o <Outlet />)
  // Se não for, redireciona para a página de login
  return isBusinessUser ? <Outlet /> : <Navigate to="/" replace />;
};

export default BusinessProtectedRoute;
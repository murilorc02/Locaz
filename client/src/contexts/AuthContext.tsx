import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from "@/types";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '../services/api';
import axios from 'axios';

interface LoginResponse {
  message: string,
  data: {
    access_token: string,
    user: {
      id: number,
      nome: string,
      email: string,
      cpf: string,
      tipo: UserRole,
      telefone: string
    }
  },
}

interface JwtPayload {
  sub: number; // id
  email: string;
  tipo: UserRole;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole, telephone: string, document: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    var decoded;
    if (token) {
      decoded = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } else {
      console.log("Sessão inválida")
    }
    const userId = decoded.sub;
    const response = await api.get<User>(`/perfil?id=${userId}`);
    setUser(response.data);
  };

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await getUserProfile();
        } catch (error) {
          console.error("Sessão inválida. Token removido.", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    loadUserFromToken();
  }, []);


  const login = async (email: string, senha: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email: email, senha: senha });
      const { data: {access_token} } = response.data;
      localStorage.setItem('authToken', access_token);
      await getUserProfile();
    } catch (error) {
      let errorMessage;

      // Verifica se o erro é uma resposta da API (como um erro 401 ou 400)
      if (axios.isAxiosError(error) && error.response) {
        // Usa a mensagem de erro específica enviada pelo seu backend
        errorMessage = error.response.data.message;
      } else {
        errorMessage = "Ocorreu um erro de rede. Tente novamente.";
      }

      toast({
        title: "Falha no Login",
        description: errorMessage, // Exibe a mensagem dinâmica
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, telephone: string, document: string) => {

    const payload = {
      nome: name,
      email: email,
      senha: password,
      tipo: role,
      telefone: telephone,
      cpf: document
    };
    await api.post('/auth/register', payload);
    await login(email, password); // loga o usuário após o cadastro
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    toast({ title: "Logout realizado" });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

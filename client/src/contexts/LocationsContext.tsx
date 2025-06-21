import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CreatePredioPayload, Location, User } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Define o tipo para o valor do contexto
interface LocationsContextType {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  addLocation: (payload: CreatePredioPayload, user: User) => Promise<void>;
  fetchLocations: () => void;
}

// Cria o contexto
const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

// Define o provedor do contexto
export const LocationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Location[]>(`/locador/predios`);
      setLocations(response.data);
    } catch (err) {
      console.error("Erro ao buscar locais:", err);
      setError("Não foi possível carregar os locais.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [user]);

  const addLocation = async (payload: CreatePredioPayload, user: User) => {
    try {
      // Agora o 'payload' tem o tipo correto e pode ser enviado diretamente
      await api.post('/locador/predios', payload);
      fetchLocations(); 
    } catch (err) {
      console.error("Erro ao adicionar local:", err);
      throw new Error("Não foi possível adicionar o novo local.");
    }
  };

  const contextValue = {
    locations,
    isLoading,
    error,
    addLocation,
    fetchLocations
  };

  return (
    <LocationsContext.Provider value={contextValue}>
      {children}
    </LocationsContext.Provider>
  );
};

// Hook customizado para usar o contexto facilmente
export const useLocations = () => {
  const context = useContext(LocationsContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationsProvider');
  }
  return context;
};

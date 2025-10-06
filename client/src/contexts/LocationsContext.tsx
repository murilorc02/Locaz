import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CreatePredioPayload, LocationsApiResponse, User } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Define o tipo para o valor do contexto
interface LocationsContextType {
  locations: LocationsApiResponse;
  isLoading: boolean;
  error: string | null;
  addLocation: (payload: CreatePredioPayload) => Promise<any>;
  fetchLocations: () => void;
}

// Cria o contexto
const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

// Define o provedor do contexto
export default function LocationsProvider ({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [locations, setLocations] = useState<LocationsApiResponse>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {

    if (!user) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<LocationsApiResponse>(`/predio/getByAll`);
      setLocations(response.data);
    } catch (err) {
      console.error("Erro ao buscar locais:", err);
      setError("Não foi possível carregar os locais.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user && user.tipo === 'locador') {
      fetchLocations();
    } else {
      setLocations(null);
      setIsLoading(false);
    }
  }, [user]);

  const addLocation = async (payload: CreatePredioPayload) => {
    try {
      // Agora o 'payload' tem o tipo correto e pode ser enviado diretamente
      await api.post('/predio/create', payload);
      await fetchLocations(); 
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

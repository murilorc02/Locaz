import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CreatePredioPayload, Location, LocationApiResponse, LocationsApiResponse } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Define o tipo para o valor do contexto
interface LocationsContextType {
  locations: LocationsApiResponse;
  isLoading: boolean;
  error: string | null;
  addLocation: (payload: CreatePredioPayload) => Promise<any>;
  fetchLocations: () => void;
  getLocationById: (locationId: number) => Promise<LocationApiResponse>;
  editLocation: (location: Partial<Location>) => Promise<any>
}

// Cria o contexto
const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

// Define o provedor do contexto
export function LocationsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [locations, setLocations] = useState<LocationsApiResponse>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<LocationsApiResponse>(`/predio/getByAll`);
      setLocations(response.data);
    } catch (err) {
      setError("Não foi possível carregar os locais.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
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

  const getLocationById = async (locationId: number) => {
    setIsLoading(true);
    try {
      const response = await api.get<LocationApiResponse>(`/predio/${locationId}`)
      return response.data;
    } catch (err) {
      throw new Error("Não foi possível encontrar o local");
    } finally {
      setIsLoading(false);
    }
  }

  const editLocation = async (location: Partial<Location>) => {
    try {
      await api.patch<LocationApiResponse>(`predio/${location.id}`, location);
      await fetchLocations();
    } catch (err) {
      throw new Error("Não foi possível editar o local");
    }
  }

  const contextValue = {
    locations,
    isLoading,
    error,
    addLocation,
    fetchLocations,
    getLocationById,
    editLocation
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
